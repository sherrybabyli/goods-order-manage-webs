<template>
	<tinymce-editor
		:value="modelValue"
		:init="init"
		:disabled="disabled"
		:id="tinymceId"
	></tinymce-editor>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { getToken } from '@/utils/auth';
import axios from 'axios';

import tinymce from 'tinymce/tinymce';
import TinymceEditor from '@tinymce/tinymce-vue';
import 'tinymce/skins/content/default/content.css';
import 'tinymce/themes/silver';
import 'tinymce/themes/silver/theme';
import 'tinymce/icons/default';
import 'tinymce/models/dom';
import 'tinymce/icons/default/icons';

// 引入插件
import 'tinymce/plugins/lists'; //列表
import 'tinymce/plugins/table'; //插入
import 'tinymce/plugins/image'; //图片
import 'tinymce/plugins/media'; //视频
import 'tinymce/plugins/wordcount'; //字数统计
import 'tinymce/plugins/link'; //显示不可见字符
import 'tinymce/plugins/code'; //源码
// import 'tinymce/plugins/codesample';
// import 'tinymce/plugins/advlist'; //高级列表
import 'tinymce/plugins/anchor'; //锚点
import 'tinymce/plugins/autosave'; //自动保存
import 'tinymce/plugins/autolink'; //自动链接
// import 'tinymce/plugins/autoresize'; //自动尺寸
// import 'tinymce/plugins/charmap'; //特殊字符
// import 'tinymce/plugins/directionality'; //文字方向
// import 'tinymce/plugins/importcss'; //引入css
// import 'tinymce/plugins/insertdatetime'; //插入日期时间
// import 'tinymce/plugins/nonbreaking'; //插入不间断空格
// import 'tinymce/plugins/quickbars'; //快速工具栏
import 'tinymce/plugins/fullscreen'; //全屏
import 'tinymce/plugins/preview'; //预览
import 'tinymce/plugins/searchreplace'; //查找替换

const baseURL = import.meta.env.VITE_APP_BASE_API;
const headers = ref({ "Authorization": 'Bearer ' + getToken() });

const emits = defineEmits(['update:modelValue']);
const props = defineProps({
	modelValue: {
		type: String,
		default: () => {
			return '';
		},
	},
	uploadURL: {
		type: String,
		default: '/sysAttachment/add',
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	plugins: {
		type: [String, Array],
		default:
			'lists table link image media anchor code autolink autosave fullscreen preview searchreplace wordcount',
	},
	toolbar: {
		type: [String, Array],
		default:
			'fontsize | forecolor backcolor bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist lists prelist numlist table link image media blockquote anchor code | removeformat undo redo fullscreen',
	},
});
const tinymceId = ref('vue-tinymce-' + Date.now());
const myEditor = ref(null);
//定义一个对象 init初始化
const init = reactive({
	selector: '#' + tinymceId.value, //富文本编辑器的id,
    convert_urls: false, //强制图片全路径
	language: 'zh-Hans', //语言
	language_url: '/tinymce/langs/zh_Hans.js', //语言包的路径
	skin_url: '/tinymce/skins/ui/oxide', //skin路径
	height: 400, //编辑器高度（autoresize插件未配置时生效）
	min_height: 200, //编辑器最小高度
	// autoresize_max_height: 500, //autoresize插件配置的编辑器最大高度
	branding: false,
	menubar: false, //顶部菜单栏
	toolbar_mode: 'wrap', //工具栏折行
	paste_data_images: true, //图片粘贴
	statusbar: false, //状态栏
	browser_spellcheck: false, //拼写检查
	placeholder: '请输入内容', //占位提示
	image_dimensions: false, //去除宽高属性
	// automatic_uploads: false, //自动上传
	// images_upload_url: props.uploadURL, //上传地址
	// images_upload_base_path: '', //上传地址host
	plugins: props.plugins, //插件
	toolbar: props.toolbar, //工具栏
	font_formats:
		'Arial=arial,helvetica,sans-serif; 宋体=SimSun; 微软雅黑=Microsoft Yahei; Impact=impact,chicago;', //字体
	fontsize_formats: '11px 12px 14px 16px 18px 24px 36px 48px 64px 72px', //文字大小
	//paste_convert_word_fake_lists: false, // 插入word文档需要该属性
	paste_webkit_styles: 'all',
	paste_merge_formats: true,
	nonbreaking_force_tab: false,
	paste_auto_cleanup_on_paste: false,
	file_picker_types: 'file',
  content_style: "img {max-width:100%;}",
	content_css: '/tinymce/skins/content/default/content.css', //以css文件方式自定义可编辑区域的css样式，css文件需自己创建并引入
	images_upload_handler(blobInfo, progress) {
		return new Promise((resolve, reject) => {
			if (blobInfo.blob().size / 1024 / 1024 > 5) {
				reject('上传失败，图片大小请控制在 5M 以内');
			} else {
				let params = new FormData();
				params.append('file', blobInfo.blob(), blobInfo.filename());
				axios
					.post(baseURL + props.uploadURL, params, { headers: headers.value })
					.then(res => {
						if (res.data.code === 200) {
							resolve('http://114.132.245.12:7979/'+res.data.data.url);
						} else {
							reject('上传失败');
						}
					})
					.catch(() => {
						reject('上传出错');
					});
			}
		});
	},
	file_picker_callback(callback, value, meta) {
		let filetype =
			'.pdf, .txt, .zip, .rar, .7z, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .mp3, .mp4';
		switch (meta.filetype) {
			case 'image':
				filetype = '.jpg, .jpeg, .png, .gif';
				break;
			case 'media':
				filetype = '.mp3, .mp4';
				break;
			case 'file':
			default:
		}
		// 模拟出一个input用于添加本地文件
		let input = document.createElement('input');
		input.setAttribute('type', 'file');
		input.setAttribute('accept', filetype);
		input.click();
		input.onchange = function () {
			let file = this.files[0];
			let params = new FormData();
			params.append('file', file);
			uploadPic(params)
				.then(res => {
					if (res.code == 200) {
						callback(res.data, { text: '文件' });
					}
				})
				.catch(() => {
					failure('上传出错');
				});
		};
	},
	init_instance_callback(editor) {
		myEditor.value = editor;
		editor.on('NodeChange Change KeyUp SetContent', () => {
		  const activeEditor = tinyMCE.activeEditor;
		  const content = activeEditor.getContent();
			// 实现组件上的双向绑定
			emits('update:modelValue', content);
		});
		// 底下这一堆无法监听到图片上传后的节点内容
		// editor.on('input', () => {
		//   const content = tinyMCE.activeEditor.getContent();
		//   console.log('input', content);
		//   this.change.emit(content);
		// });
		// editor.on('paste', () => {
		//   const content = tinyMCE.activeEditor.getContent();
		//   console.log('paste', content);
		//   this.change.emit(content);
		// });
		// editor.on('ExecCommand', () => {
		//   const content = tinyMCE.activeEditor.getContent();
		//   console.log('ExecCommand', content);
		//   this.change.emit(content);
		// });
	},
	setup(editor) {
		editor.on('init', (e) => {
			editor.setContent(props.modelValue);
		});
	}
});
//在onMounted中初始化编辑器
onMounted(() => {
	tinymce.init({});
});
</script>
