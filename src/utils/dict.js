import useDictStore from '@/store/modules/dict'
import { getDicts } from '@/api/system/dict/data'

/**
 * 获取字典数据
 */
export function useDict(...args) {
  const res = ref({})
  return (() => {
    args.forEach((dictType, index) => {
      res.value[dictType] = []
      const dicts = useDictStore().getDict(dictType)
      if (dicts) {
        res.value[dictType] = dicts
      } else {
        getDicts(dictType).then(resp => {
          res.value[dictType] = resp.data.map(p => ({ label: p.dictLabel, value: p.dictValue, elTagType: p.listClass, elTagClass: p.cssClass }))
          useDictStore().setDict(dictType, res.value[dictType])
        })
      }
    })
    return toRefs(res.value)
  })()
}

/**
 * 格式化表单普通下拉选择数据（后端要求对象值）
 * @param dictArrs 字典数据
 * @param selectedValue 已选数据
 * @returns 返回选择节点对象
 */
export function getSelectedValue(dictArrs, selected) {
  if (!dictArrs || !selected) return null
  let res = null
  for (let item of dictArrs) {
    if (item.value === selected.value || item.value === selected) {
      res = {
        label: item.label,
        value: item.value
      }
      break
    }
  }
  return res
}

/**
 * 格式化表单级联下拉选择数据（针对级联非强制关联主节点的场景，后端只取当前选取节点的值或对象值）
 * @param dictArrs 字典数据
 * @param selectedArrs 已选数据
 * @returns 返回选择节点对象
 */
export function foreachdown(dictArrs, selectedArrs) {
  if (!dictArrs || !selectedArrs) return null
  return __foreachdown__(dictArrs, selectedArrs, 0)
}

function __foreachdown__(arrs = [], values = [], current = 0) {
  let res = null
  for (let item of arrs) {
    if (current < values.length - 1) {
      res = __foreachdown__(item.children, values, current + 1)
    } else {
      res = {
        label: item.label,
        value: item.value
      }
    }
    break
  }
  return res
}

/**
 * 回显表单级联下拉选择数据（针对级联非强制关联主节点的场景）
 * 后端只取当前选取节点的值或对象值，故需循环时恢复上级节点值
 * @param dictArrs 字典数据
 * @param selected 已选数据
 */
export function foreachup(dictArrs = [], selected) {
  if (!dictArrs || !selected) return []
  if (selected.value) {
    // 授予部门单选，值形式{value:'102',label:'',...}
    return __foreachup__(dictArrs, data => data.value === selected.value, [])
  }
  let res = []
  if (selected.length) {
    // 服务区域多选，值形式[[100,102],[100, 103, 105]]
    for (let value of selected) {
      const itemValues = __foreachup__(dictArrs, data => data.value === value, [])
      res.push(itemValues)
    }
  }
  return res
}

function __foreachup__(arrs = [], func, path) {
  for (let item of arrs) {
    path.push(+item.value)
    if (func(item)) return path
    if (item.children) {
      const findChildren = __foreachup__(item.children, func, path)
      if (findChildren.length) return findChildren
    }
    path.pop()
  }
  return []
}