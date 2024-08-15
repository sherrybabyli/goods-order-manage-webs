<template>
    <div class="app-container home">
        <el-row>
            <el-col>
                <img src="../assets/images/welcome.png" class="home">
            </el-col>

        </el-row>
    </div>
</template>

<script setup name="Index">
    const version = ref('1.0.0')

    function goTarget(url) {
        window.open(url, '__blank')
    }
</script>

<style scoped lang="scss">
    .home {
        height: 100%;
        width: 100%;
        background-image: url("../assets/images/welcome.png");
    }
</style>

