// pages/ai-kefu/ai-kefu.js
Page({
  data: {
    inputValue: '',
    isThink: false,
    streamBuffer: '',
    list: [],
    updateTimer: null,
    messages: [], // [{role: 'user'|'sys', content: '...'}]
    systemStream: '', // 系统流式内容
    scrollToView: '' // 滚动定位id
  },
  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  onSend() {

    if (!this.data.inputValue.trim()) return;
    // console.log('user发送了:',this.data.inputValue)
    
    const requestTask = wx.request({
      url: `http://192.168.1.4:8080/ai/v2/chat?message=`+this.data.inputValue,
      method: "GET",
      enableChunked: true, // 开启流式传输
      responseType: "arraybuffer", // 推荐使用arraybuffer，兼容性更好
    });

    // console.log("查看当前聊天信息有几条内容：", this.data.messages.length)
    if (this.data.messages.length > 0) {
      // 添加用户消息到消息列表
      this.setData({
        messages: [...this.data.messages, {role: 'sys', sysContent: this.data.systemStream}],
        systemStream: '',
        scrollToView: `msg${this.data.messages.length}`
      });
    }


    // 添加用户消息到消息列表
    this.setData({
      messages: [...this.data.messages, {role: 'user', userContent: this.data.inputValue}],
      inputValue: '',
      scrollToView: `msg${this.data.messages.length}`
    });

    if (requestTask?.onChunkReceived) {
      console.log("开始接收系统流式回复")
      requestTask.onChunkReceived(this.handleChunkData.bind(this));
      
      // 添加请求完成的回调，将流式内容添加到消息列表
      requestTask.onComplete = (res) => {
        console.log("添加请求完成的回调，将流式内容添加到消息列表")
        // this.onSystemStreamEnd();
      };
    } else {
      this.normalRequest();
    }
  },
  handleChunkData(res) {
    try {
      // const decoder = new TextDecoder('utf-8');
      // const text = decoder.decode(res.data);


      // console.log("uint8ArrayToNumber=>", this.uint8ArrayToString(res.data))
      const text = this.uint8ArrayToString(res.data);
      // console.log(text)
      
      this.setData({
        systemStream: this.data.systemStream + text,
        scrollToView: `msgStream`
      });
    } catch (e) {
      console.error("数据处理异常:", e);
    }
  },
  uint8ArrayToString(bytes) {
      		// e.data为获取到的流数据
		let txt;
		// 进行判断返回的对象是Uint8Array（开发者工具）或者ArrayBuffer（真机）
		// 1.获取对象的准确的类型
		const type = Object.prototype.toString.call(bytes); // Uni8Array的原型对象被更改了所以使用字符串的信息进行判断。
		if(type ==="[object Uint8Array]"){
			console.log("Uint8Array");
			txt=decodeURIComponent(escape(String.fromCharCode(bytes)))
		}else if(bytes instanceof ArrayBuffer){
			// 将ArrayBuffer转换为Uint8Array
			console.log("ArrayBuffer");
			const uint8Array = new Uint8Array(bytes);
			txt=decodeURIComponent(escape(String.fromCharCode(...uint8Array)))
		}
		// 打印编码的结果
		console.log(txt);

      return txt
  }
})