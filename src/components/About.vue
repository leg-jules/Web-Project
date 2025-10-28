<template>
  <div class="about">
    <h2>About Page</h2>
    
    <!-- Conditional classes & styles -->
    <div 
      :class="{ 'active': isActive, 'highlight': isHighlighted }"
      :style="{ padding: paddingSize, backgroundColor: bgColor }"
    >
      This div has dynamic styles and classes
    </div>
    
    <button @click="changeStyles">Change Styles</button>
  </div>
</template>

<script>
export default {
  name: 'AboutPage',  
  data() {
    return {
      isActive: true,
      isHighlighted: false,
      paddingSize: '20px',
      bgColor: 'lightblue'
    }
  },
  methods: {
    changeStyles() {
      this.isActive = !this.isActive
      this.isHighlighted = !this.isHighlighted
      this.bgColor = this.bgColor === 'lightblue' ? 'lightgreen' : 'lightblue'
    }
  }
}
</script>

<style scoped>
.active {
  border: 2px solid blue;
}
.highlight {
  font-weight: bold;
  color: darkred;
}
</style>

