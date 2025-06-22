// pages/ai-kefu/ai-kefu.js
Page({
  data: {
    inputValue: '',
    isThink: false,
    streamBuffer: '',
    list: [],
    updateTimer: null
  },
  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  onSend() {
    console.log('用户输入内容：', this.data.inputValue)
    // 这里可以继续处理发送逻辑

    const requestTask = wx.request({
      url: `http://192.168.1.4:8080/ollama/ai/health/chat?question=`+this.data.inputValue,
      method: "GET",
      enableChunked: true, // 开启流式传输
      responseType: "arraybuffer", // 推荐使用arraybuffer，兼容性更好
    });

    if (requestTask?.onChunkReceived) {
      requestTask.onChunkReceived(this.handleChunkData);
    } else {
      // 不支持流式，降级为普通请求
      this.normalRequest();
    }

  },
  handleChunkData(res) {
    try {


      // 处理中文乱码
      const decoder = new TextDecoder('utf-8'); // 尝试 utf-8/gbk
      const text = decoder.decode(res.data);

      let lines = text.split('\n');
      for (let line of lines) {
        line = line.trim().replace("data:","");
        if (line != '' && line != null) {
          const obj = JSON.parse(line);
          const content = obj?.result?.output?.content;
          console.log('解析后的content:', content);
        }
      }
  
    } catch (e) {
      console.error("数据处理异常:", e);
    }
  }


})