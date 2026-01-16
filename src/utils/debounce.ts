export const debounce = <F extends (...args: any[]) => any>(func: F, delay: number) => {
  let timeout: ReturnType<typeof setTimeout> | undefined

  return (...args: Parameters<F>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => func(...args), delay)
  }
}