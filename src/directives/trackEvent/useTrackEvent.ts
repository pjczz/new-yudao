export const clickTrackDirective = {
  mounted(el, binding) {

    const trackClickEvent = () => {
      const trackInfo = binding.value; // 获取指令传入的埋点信息
      console.log('trackClickEvent')
      if((window as any).$useTrack){
        (window as any).$useTrack.setClickParams(trackInfo); // 调用 store 中的方法进行埋点上报
      }
      
    };

    el.addEventListener('click', trackClickEvent);

    // 存储事件处理函数以便后续解绑
    el._trackClickEvent = trackClickEvent;
  },
  beforeUnmount(el) {
    el.removeEventListener('click', el._trackClickEvent);
    delete el._trackClickEvent; // 清理存储的函数
  },
};
