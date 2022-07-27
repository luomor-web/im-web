<template>
  <div class="emotion-search">
    <!--    <v-text-field hide-details rounded dense filled placeholder="搜索" />-->
    <input  class="emotion-search-input" placeholder="搜索" />
    <div v-for="i of 25" :key="i" class="emotion-search-img">
      <v-img v-if="i %2 ===0" src="https://miniodev.o0o0oo.com/courier/1551943288406278144.gif" />
      <v-img v-else src="https://miniodev.o0o0oo.com/courier/1551940822952443904.jpg" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmotionSearch'
}
</script>

<style scoped lang="scss">
.emotion-search {
  padding: 8px;

  .emotion-search-input {
    font-size: 16px;
    display: block;
    width: 100%;
    padding: .2em .6em;
    border-radius: 25px;
    border: 1px solid #d9d9d9;
    outline: 0;
    margin-bottom: 8px;
  }

  .emotion-search-img {
    margin: 3px;
    //background-color: #b7c1ca;
    height: 75px;
    width: 75px;
    display: inline-block;
    transition: all 0.2s;

    &:hover {
      transform: scale(1.1);
      opacity: 0.7;
    }
  }
}
</style>
