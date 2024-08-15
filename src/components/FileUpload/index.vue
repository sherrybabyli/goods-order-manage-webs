<template>
  <div class="upload-file">
    <el-upload
            :action="uploadFileUrl"
            :before-upload="handleBeforeUpload"
            :file-list="fileList"
            :limit="limit"
            :show-file-list="false"
            :headers="headers"
            class="upload-file-uploader"
            ref="fileUpload"
            :http-request="uploadFile"
    >
      <!-- 上传按钮 -->
      <el-button type="primary" >选取文件</el-button>
    </el-upload>
    <!-- 上传提示 -->
    <div class="el-upload__tip" v-if="showTip">
      请上传
      <template v-if="fileSize"> 大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b> </template>
      <template v-if="fileType"> 格式为 <b style="color: #f56c6c">{{ fileType.join("/") }}</b> </template>
      的文件
    </div>

      <!-- 进度条 -->
      <el-progress v-show="isLoading" :percentage="percentage"></el-progress>
    <!-- 文件列表 -->
    <transition-group class="upload-file-list el-upload-list el-upload-list--text" name="el-fade-in-linear" tag="ul">
      <li :key="file.url" class="el-upload-list__item ele-upload-list__item-content" v-for="(file, index) in fileList">
        <el-link :href="file.url" :underline="false" target="_blank">
          <span class="el-icon-document"> {{ getFileName(file.name) }} </span>
        </el-link>
        <div class="ele-upload-list__item-content-action">
          <el-link :underline="false" @click="handleDelete(index)" type="danger">删除</el-link>
        </div>
      </li>
    </transition-group>
  </div>
</template>

<script setup>
    import { getToken } from "@/utils/auth";
    import { listByIds, delOss } from "@/api/system/oss";
    import SparkMD5 from 'spark-md5';
    import axios from "axios";
    const props = defineProps({
        modelValue: [String, Object, Array],
        // 数量限制
        limit: {
            type: Number,
            default: 1,
        },
        // 大小限制(MB)
        fileSize: {
        //    type: Number,
        //    default: 5,
        },
        // 文件类型, 例如['png', 'jpg', 'jpeg']
        fileType: {
           // type: Array,
            default: () => ["doc", "xls", "ppt", "txt", "pdf","mp4","docx","xlsx","ppts"],
        },
        // 是否显示提示
        isShowTip: {
            type: Boolean,
            default: true
        }
    });

    const { proxy } = getCurrentInstance();
    const emit = defineEmits();
    const number = ref(0);
    const uploadList = ref([]);
    const baseUrl = import.meta.env.VITE_APP_BASE_API;
    const percentage = ref(0);
    const uploadFilePark = ref(baseUrl + "/resource/oss/uploadFilePark"); // 上传文件服务器地址
    const uploadPar = ref(baseUrl + "/resource/oss/uploadPar"); // 上传文件服务器地址
    const uploadFileMerge = ref(baseUrl + "/resource/oss/uploadFileMerge"); // 上传文件服务器地址
    const headers = ref({ Authorization: "Bearer " + getToken() });
    const fileList = ref([]);
    let isLoading=false;
    const showTip = computed(
        () => props.isShowTip && (props.fileType || props.fileSize)
    );

    watch(() => props.modelValue, async val => {
        if (val) {
            let temp = 1;
            // 首先将值转为数组
            let list;
            if (Array.isArray(val)) {
                list = val;
            } else {
                await listByIds(val).then(res => {
                    list = res.data.map(oss => {
                        oss = { name: oss.originalName, url: oss.url, ossId: oss.ossId };
                        return oss;
                    });
                })
            }
            // 然后将数组转为对象数组
            fileList.value = list.map(item => {
                item = {name: item.name, url: item.url, ossId: item.ossId};
                item.uid = item.uid || new Date().getTime() + temp++;
                return item;
            });
        } else {
            fileList.value = [];
            return [];
        }
    },{ deep: true, immediate: true });

    async function uploadFile(file) {
      let fileName = file.file.name;
      if (fileName.length > 64) {
        proxy.$modal.msg('文件名称小于64个字符');
        return;
      }
      let md5 = new SparkMD5.ArrayBuffer();
      let fileReader = new FileReader();
      let md51;
      fileReader.readAsArrayBuffer(file.file);
      fileReader.onload = await async function (e) {
        md5.append(e.target.result);
        md51 = md5.end();
          const response = await axios({
            timeout: 30000,
            method: "get",
            url: uploadPar.value,
            params: {
              md5: md51
            },
            headers: {Authorization: "Bearer " + getToken(), "Content-Type": "application/json"},
          });
          if (response.data.data.url === null) {
            let num = 1;
            if (response.data.data.ossId != null) {
              num = response.data.data.ossId
            }
            const initUploadParams = new FormData();
            initUploadParams.append("md5", md51);
            initUploadParams.append("fileName", file.file.name);
            const response2 = await axios({
              timeout: 30000,
              method: "post",
              url: uploadFileMerge.value,
              data: initUploadParams,
              headers: {Authorization: "Bearer " + getToken(), "Content-Type": "application/json"},
            });
            console.log("合并成功", response2.data);
            handleUploadSuccess(response2.data, file);
            let i = num;
            isLoading=true;
            const readSize = 1024 * 1024 * 20;
            const filePartNum = Math.ceil(file.file.size / readSize)
            let nums = filePartNum;
            for (i; i < filePartNum + 1; i++) {
              let startSize = (i - 1) * readSize;
              let endSize = i * readSize;
              const initUploadParams = new FormData();
              const fileChunk = file.file.slice(startSize, endSize)
              initUploadParams.append("filePartNum", i);
              initUploadParams.append("file", fileChunk);
              console.log("批次", fileChunk.size);
              initUploadParams.append("totalNum", filePartNum);
              initUploadParams.append("name", file.file.name);
              initUploadParams.append("md5", md51);
              initUploadParams.append("fileName", fileChunk.name);
              await uploadHandler(initUploadParams, nums,i);
            }
          } else {
            console.log("合并成功");
            handleUploadSuccess(response.data, file);
          }

        console.log(md51);
      };
    }
    async function uploadHandler(initUploadParams, nums,i) {
      try {
        const response = await axios({
          timeout: 30000,
          method: "post",
          url: uploadFilePark.value,
          data: initUploadParams,
          headers: {Authorization: "Bearer " + getToken(), "Content-Type": "multipart/form-data"},
        });
        const data = response.data;
        if (data.code === 200) {
          percentage.value= ((i / nums) * 100).toFixed(2);
          emit('completed',percentage.value);
          if (percentage.value === '100.00'){
            isLoading=false;
            percentage.value='0';
          }
        } else {
          console.log(data.msg);
        }
      } catch (error) {
        isLoading=false;
        console.log(error);
      }
    }
    // md5值计算
    function fileMd5Sum(file) {
      return new Promise(resolve => {
        let fileReader = new FileReader()
        let Spark = new SparkMD5.ArrayBuffer()
        fileReader.readAsArrayBuffer(file)
        fileReader.onload = function (e) {
          Spark.append(e.target.result)
          let md5 = Spark.end()
          resolve(md5)
        }
      });
    }


    // 上传前校检格式和大小
    function handleBeforeUpload(file) {
        // 校检文件类型
        if (props.fileType.length) {
            const fileName = file.name.split('.');
            const fileExt = fileName[fileName.length - 1];
            const isTypeOk = props.fileType.indexOf(fileExt) >= 0;
            if (!isTypeOk) {
                proxy.$modal.msgError(`文件格式不正确, 请上传${props.fileType.join("/")}格式文件!`);
                return false;
            }
        }
        // 校检文件大小
        if (props.fileSize) {
            const isLt = file.size / 1024 / 1024 < props.fileSize;
            if (!isLt) {
                proxy.$modal.msgError(`上传文件大小不能超过 ${props.fileSize} MB!`);
                return false;
            }
        }
        proxy.$modal.loading("正在读取文件信息,准备上传,请稍候...");
        number.value++;
        return true;
    }

    // 文件个数超出
    function handleExceed() {
        proxy.$modal.msgError(`上传文件数量不能超过 ${props.limit} 个!`);
    }

    // 上传失败
    function handleUploadError(err) {
      proxy.$modal.msgError("上传文件失败");
      uploadedSuccessfully();
    }

    // 上传成功回调
    function handleUploadSuccess(res, file) {
        console.log("成功回调",res,res.code === 200);
        if (res.code === 200) {
            uploadList.value.push({ name: res.data.fileName, url: res.data.url, ossId: res.data.ossId });
            uploadedSuccessfully();
        } else {
            number.value--;
            proxy.$modal.closeLoading();
            proxy.$modal.msgError(res.msg);
            proxy.$refs.fileUpload.handleRemove(file);
            uploadedSuccessfully();
        }
    }

    // 删除文件
    function handleDelete(index) {
        // let ossId = fileList.value[index].ossId;
        // delOss(ossId);
        emit('completed',percentage.value);
        fileList.value.splice(index, 1);
        // emit("update:modelValue", listToString(fileList.value));
        emit("update:modelValue", fileList.value);
    }

    // 上传结束处理
    function uploadedSuccessfully() {
        if (number.value > 0 && uploadList.value.length === number.value) {
            fileList.value = fileList.value.filter(f => f.url !== undefined).concat(uploadList.value);
            uploadList.value = [];
            number.value = 0;
            // emit("update:modelValue", listToString(fileList.value));
            emit("update:modelValue", fileList.value);
            proxy.$modal.closeLoading();
        }
    }

    // 获取文件名称
    function getFileName(name) {
        // 如果是url那么取最后的名字 如果不是直接返回
        if (name.lastIndexOf("/") > -1) {
            return name.slice(name.lastIndexOf("/") + 1);
        } else {
            return name;
        }
    }

    // 对象转成指定字符串分隔
    function listToString(list, separator) {
        let strs = "";
        separator = separator || ",";
        for (let i in list) {
            if(list[i].ossId) {
                strs += list[i].ossId + separator;
            }
        }
        return strs != "" ? strs.substr(0, strs.length - 1) : "";
    }
</script>

<style scoped lang="scss">
  .upload-file-uploader {
    margin-bottom: 5px;
  }
  .upload-file-list .el-upload-list__item {
    border: 1px solid #e4e7ed;
    line-height: 2;
    margin-bottom: 10px;
    position: relative;
  }
  .upload-file-list .ele-upload-list__item-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: inherit;
  }
  .ele-upload-list__item-content-action .el-link {
    margin-right: 10px;
  }
</style>
