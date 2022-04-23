<template>
<div>
<!--  <template #right-drawer="{}">-->
<!--    <right-drawer-->
<!--        ref="rightDrawer"-->
<!--        :room="curRoom"></right-drawer>-->
<!--  </template>-->

  <!--        @up-room="upRoom"-->
  <!--        @change-room="changeRoom"-->
  <!--        @call="call"-->
  <template #room-options="{}">
                  @open="openRightDrawer"
    <room-options
        :room-id="roomId"
    >
    </room-options>

  </template>
</div>
</template>

<script>
export default {
  name: "RoomOptionsControl",
  props: {
    roomId: {type: String, default: ''}
  }
}
</script>

<style scoped>

</style>
