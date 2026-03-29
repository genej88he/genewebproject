const timerState = {
    accumulatedTime: 0,
    lastActiveTime: Date.now(),
    lastTickTime: null,
    paused: false,
  };
  
  export default timerState;