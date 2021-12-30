import {ref} from "@vue/composition-api";

export const messageActions = ref([
    {
        name: 'replyMessage',
        title: '回复'
    },
    // {
    //     name: 'editMessage',
    //     title: '编辑',
    //     onlyMe: true
    // },
    {
        name: 'deleteMessage',
        title: '删除',
        onlyMe: true
    }
])

