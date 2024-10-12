// src/mixins/trackMixin.ts
import { defineComponent } from 'vue';

export default defineComponent({
  mounted() {
    this.trackEvent();
  },
  methods: {
    trackEvent() {
      // 这里是你要发送埋点请求的逻辑
      const eventData = {
        componentName: this.$options.name || 'UnknownComponent',
        timestamp: new Date().toISOString(),
      };
      console.log('埋点数据:', eventData);
      // 这里发送埋点请求，可以是通过图片请求发送或者其他方式
      // 例如：new Image().src = `https://your-tracking-url?data=${JSON.stringify(eventData)}`;
    },
  },
});
