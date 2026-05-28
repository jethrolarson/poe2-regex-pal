export const copy_to_clipboard = (text: string, on_success?: () => void): void => {
  void navigator.clipboard.writeText(text).then(() => {
    on_success?.()
  })
}
