import { ref } from "vue";
import { delay } from "@/helpers/utils.js";
import { useGlobalStore } from "@/stores/globalStore";

export function useActionWithCancel(duration = 3000) {
  let timer
  const cancelTimer = ref(0)
  const { cancelToast } = useGlobalStore()

  const execute = async (msg, runCB, finallyCB, cancelCB) => {
    const reset = () => {
      clearInterval(timer)
      cancelTimer.value = 0
    }
    reset()
  
    const data = runCB()

    let isExecuted = true
    timer = setInterval(() => {
      cancelTimer.value += 0.01
      if (cancelTimer.value > 1) reset()
    }, duration / 100)
  
    cancelToast(msg, () => {
      isExecuted = false
      reset()
      cancelCB(data)
    }, duration)
  
    await delay(duration + 500)
    if (!isExecuted) return
    
    finallyCB(data)
  }

  return { cancelTimer, execute }
}