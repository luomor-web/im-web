<template>
    <video style="object-fit:fill" width="100%" height="100%" autoplay />
</template>

<script>
export default {
    name: 'OvVideo',

    props: {
        streamManager: { type: Object, default: () => {} }
    },

    mounted () {
        this.streamManager.addVideoElement(this.$el)
    }
}
</script>

<style lang="scss" scoped>

video {
    transform: rotateY(180deg);
}

</style>
