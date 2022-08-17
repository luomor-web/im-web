import { ref } from '@vue/composition-api'

export const questions = ref([
  {
    id: 'CITY',
    value: '你从小生活的城市在哪里?'
  },
  {
    id: 'PET',
    value: '你的宠物叫什么名字?'
  },
  {
    id: 'PERSON',
    value: '你始终难忘的人是谁?'
  }
])
