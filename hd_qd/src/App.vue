<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup>

</script>

<style>

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f4f7f9;
  color: #333;
}

.app-container {
  width: 100%;
  min-height: 100vh;
}
</style>