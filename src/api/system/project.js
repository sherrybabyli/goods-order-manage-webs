import request from '@/utils/request'

// 查询项目配置列表
export function listProject(query) {
    return request({
        url: '/system/project/list',
        method: 'get',
        params: query
    })
}

// 查询项目配置详细
export function getProject(projectId) {
    return request({
        url: '/system/project/' + projectId,
        method: 'get'
    })
}

// 新增项目配置
export function addProject(data) {
    return request({
        url: '/system/project',
        method: 'post',
        data: data
    })
}

// 修改项目配置
export function updateProject(data) {
    return request({
        url: '/system/project',
        method: 'put',
        data: data
    })
}

// 删除项目配置
export function delProject(projectId) {
    return request({
        url: '/system/project/' + projectId,
        method: 'delete'
    })
}


// 状态修改
export function changeProjectStatus(projectId, status) {
    const data = {
        projectId,
        status
    }
    return request({
        url: '/system/project/changeStatus',
        method: 'put',
        data: data
    })
}
