<template>
  <router-view />
</template>

<script setup>
import useSettingsStore from '@/store/modules/settings'
import { handleThemeStyle } from '@/utils/theme'

onMounted(() => {
  nextTick(() => {
    // 初始化主题样式
    handleThemeStyle(useSettingsStore().theme)
  })
})
</script>

<style lang="scss">
.el-form-item--default .el-form-item__label {
  position: relative;
  line-height: 1.2 !important;
  display: flex;
  align-items: center;
  text-align: right;
}
.el-form-item.is-required:not(.is-no-asterisk).asterisk-left > .el-form-item__label-wrap > .el-form-item__label::before,
.el-form-item.is-required:not(.is-no-asterisk).asterisk-left > .el-form-item__label::before {
  position: absolute;
  top: 9px;
  right: -1px;
  font-size: 18px;
  font-weight: bold;
}
/* 常量值输入框样式，需设置disbled属性并加上const-input类 */
.el-input.is-disabled.const-input .el-input__wrapper {
  background-color: #fff !important;
  box-shadow: none !important;
}
.el-cascader__tags .el-tag > span {
  line-height: 1.2;
}
.custom-form-item {
  &.label-80 .el-form-item__label {
    width: 80px !important;
  }
  &.label-90 .el-form-item__label {
    width: 90px !important;
  }
  &.label-100 .el-form-item__label {
    width: 100px !important;
  }
}
.table-row-image {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  padding: 3px 10px;
  background: lightcyan;
  color: #333;
  font-size: 10px;
  line-height: 1;
  border-radius: 8px;
}
.custom-image-upload {
  .el-upload-list__item,
  .el-upload-list__item-actions {
    width: 130px !important;
    height: 130px !important;
  }
}
// 地图搜索下拉框层级
.amap-sug-result {
  z-index: 9999;
  visibility: visible;
}
.amap-logo,
.amap-copyright {
  display: none !important;
}
</style>