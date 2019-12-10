<template>
  <div class="index">
    <q-toolbar color="amber">
      <q-btn @click="rightDrawerOpen = !rightDrawerOpen" flat round dense icon="mail" />
    </q-toolbar>
    <q-card class="qi_pan">
      <p class="text-negative">下一步: {{nextStep}}</p>
      <p class="text-tertiary">当前在线人数: {{userOnline}}</p>
      <p class="text-primary">你的身份: {{yourID}}</p>
      <p class="text-warning">房间人数到达两人即可开始对战, 不能悔棋</p>
      <q-btn glossy color="primary" label="再来一局" @click="restart" :disabled="yourID==='观战者'" />
      <div class="relative-position">
        <table id="qi_pan_table">
          <tr v-for="(item, index) in qipan_arr" :key="index">
            <td v-for="(itemChild, indexChild) in item" :key="indexChild">
              <span v-if="itemChild === '黑方'" style="background: black;" :class="positionFormatter(index, indexChild)?'on':null"></span>
              <span v-else-if="itemChild === '白方'" style="background: white;" :class="positionFormatter(index, indexChild)?'on':null"></span>
              <span v-else @click="xiaqi(index, indexChild)"></span>
            </td>
          </tr>
        </table>
        <q-inner-loading :showing="visible">
          <q-spinner-ball size="50px" color="primary" />
          {{battleResult}}
        </q-inner-loading>
      </div>
    </q-card>
    <q-drawer
      side="right"
      v-model="rightDrawerOpen"
      bordered
      content-class="bg-grey-2 chat"
      content-style="padding: 1rem;"
    >
      <q-chat-message :label="today" />
      <q-chat-message
        v-for="(item, index) in chatArr"
        :key="index"
        :name="item.ID"
        :avatar="item.imgUrl"
        :text="[item.text]"
        :stamp="dateFormatter(item.date)"
        :sent="yourID === item.ID"
      />
      <q-input v-model="chatContent" class="chatInput">
        <q-btn color="primary" size="md" label="发送" @click="submitMessage" />
      </q-input>
    </q-drawer>
  </div>
</template>

<script>
// @ is an alias to /src
export default {
  name: "home",
  data() {
    return {
      nextStep: "黑方", // 下一步
      userOnline: "1", // 当前在线人数
      yourID: "黑方", // 你的ID
      qipan_arr: [], // 棋盘的落子情况
      chatContent: "", // 聊天输入框信息
      chatArr: [], // 聊天列表
      rightDrawerOpen: true, // 控制聊天框的开关
      positionNow: [],
      visible: false, // 棋盘遮罩
      battleResult: '', // 对战结果
    };
  },
  created() {
    for (let i = 0; i < 18; i++) {
      // 初始化棋盘
      let childArr = [];
      for (let j = 0; j < 18; j++) {
        childArr.push(j);
      }
      this.qipan_arr.push(childArr);
    }
  },
  computed: {
    today() {
      const date = new Date();
      let y = date.getFullYear();
      let m =
        date.getMonth() + 1 < 10
          ? `0${date.getMonth() + 1}`
          : date.getMonth() + 1;
      let d = date.getDate();
      return `${y}-${m}-${d}`;
    }
  },
  mounted() {
    if ("WebSocket" in window) {
      this.startXiaQiWs();
      this.startChatWs();
    } else {
      // 浏览器不支持 WebSocket
      console.error("您的浏览器不支持 WebSocket!");
    }
    this.$nextTick(() => {
      let eleArr = document.querySelectorAll("#qi_pan_table>tr>td");
      for (let i = 0; i < eleArr.length; i++) {
        eleArr[i].style.height = eleArr[i].offsetWidth + 'px';
      }
    });
  },
  methods: {
    // 再来一局对方确认事件
    waitConfirm(msg, ID) {
      let isAgree = false;
      this.$q.dialog({
        title: '来自建国的通知',
        message: msg,
        ok: '同意',
        cancel: '不同意',
      }).onOk(() => {
        isAgree = true;
      }).onCancel(() => {
        isAgree = false;
      }).onDismiss(() => {
        this.ajax(
          'POST', 
          '/isAgree', 
          {
            isAgree: isAgree,
            ID: ID,
            yourID: this.yourID,
          },
          function(res) {
            console.log(res);
          }
        );
      })
    },
    // 对方是否同意弹框
    otherPartyAgree(msg) {
      this.$q.dialog({
        title: '来自建国的提示',
        message: msg
      })
    },
    ajax(type, url, data, callback) {
      let xhr = new XMLHttpRequest();
      xhr.open(type, `http://10.10.16.92:3000${url}`, true);
      xhr.setRequestHeader("Content-type", "application/json");
      xhr.send(JSON.stringify(data));
      xhr.onreadystatechange = () => {
        if (xhr.status === 200 && xhr.readyState === 4) {
          callback(JSON.parse(xhr.responseText));
        }
      }
    },
    // 再来一局
    restart() {
      let num = this.qipan_arr.reduce((sum, item) => {
        for (let i = 0; i < item.length; i++) {
          if (item[i] === '黑方' || item[i] === '白方') {
            sum = sum + 1;
          }
        }
        return sum;
      }, 0);
      if (num < 5) {
        this.$q.notify('多走几步吧， 求求你了');
        return;
      }
      this.ajax(
        'POST', 
        '/restart',
        {
          ID: this.yourID,
        },
        function(res) {
          console.log(res);
        }
      );
    },
    positionFormatter(i, j) {
      if (this.positionNow.length === 2) {
        if (this.positionNow[0] === i && this.positionNow[1] === j) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
    dateFormatter(data) {
      const date = new Date(data);
      let h = date.getHours() >= 10 ? date.getHours() : `0${date.getHours()}`;
      let m =
        date.getMinutes() >= 10 ? date.getMinutes() : `0${date.getMinutes()}`;
      let s =
        date.getSeconds() >= 10 ? date.getSeconds() : `0${date.getSeconds()}`;
      return `${h}:${m}:${s}`;
    },
    submitMessage() {
      if (this.chatContent.trim() !== "") {
        this.chatWs.send(
          JSON.stringify({
            ID: this.yourID,
            text: this.chatContent,
            date: new Date(),
            imgUrl: this.yourID === "黑方" ? "img/img1.jpg" : "img/img2.jpg"
          })
        );
        this.chatContent = "";
      } else {
        this.$q.notify({
          message: `请勿发送空消息!`,
          timeout: 3000, // 以毫秒为单位; 0意味着没有超时
          color: "yellow",
          textColor: "black", // 如果默认的“white”不适合
          position: "top-right" // 'top', 'left', 'bottom-left'等
        });
      }
    },
    xiaqi(i, j) {
      if (this.yourID === "观战者") {
        alert("");
        this.$q.notify({
          message: `你是观战者， 不要动,  看就好了`,
          timeout: 3000, // 以毫秒为单位; 0意味着没有超时
          color: "yellow",
          textColor: "black", // 如果默认的“white”不适合
          position: "top-left" // 'top', 'left', 'bottom-left'等
        });
        return;
      }
      if (this.yourID.includes(this.nextStep)) {
        this.nextStep = this.nextStep === "黑方" ? "白方" : "黑方";
        this.xiaQiWs.send(
          JSON.stringify({
            ID: this.yourID,
            next: this.nextStep,
            position: [i, j],
          })
        );
      } else {
        this.$q.notify({
          message: `请先等待对手落子${i}-${j}`,
          timeout: 3000, // 以毫秒为单位; 0意味着没有超时
          color: "yellow",
          textColor: "black", // 如果默认的“white”不适合
          position: "top-left" // 'top', 'left', 'bottom-left'等
        });
      }
    },
    startChatWs() {
      this.chatWs = new WebSocket("ws://10.10.16.92:3000/chat");
      this.chatWs.onopen = () => {
        console.info("聊天连接已打开");
      };
      this.chatWs.onmessage = res => {
        // 接受消息
        let data = JSON.parse(res.data);
        this.chatArr = data.chatArr;
        this.rightDrawerOpen = true;
      };
      this.chatWs.onclose = () => {
        // 关闭 websocket
        console.info("聊天连接已关闭...");
      };
    },
    startXiaQiWs() {
      // 开启下棋websoket调用
      this.xiaQiWs = new WebSocket("ws://10.10.16.92:3000/battle");
      this.xiaQiWs.onopen = () => {
        console.info("下棋连接已打开");
      };
      this.xiaQiWs.onmessage = res => {
        let data = JSON.parse(res.data);
        if (data.isAgain) {
          if (this.yourID !== '观战者' && this.yourID !== data.ID) {
            this.waitConfirm(data.msg, data.ID);
          }
          return;
        }
        if (data.isAgree) {
          if (this.yourID === data.ID) {
            this.otherPartyAgree(data.msg);
          }
          return;
        }
        if (data.battleResult) {
          this.battleResult = data.battleResult;
          this.visible = true;
        }
        this.qipan_arr = data.arr;
        this.positionNow = data.position;
        this.nextStep = data.title;
        this.userOnline = data.userOnline;
        if (data.name) {
          this.yourID = data.name;
        }
      };
      this.xiaQiWs.onclose = () => {
        // 关闭 websocket
        console.info("下棋连接已关闭...");
      };
    }
  }
};
</script>
<style lang="stylus" scoped>
.index {
  display: flex;
  flex-wrap: wrap;

  .qi_pan {
    padding: 1rem;
    margin: 2rem auto 0;

    table {
      border-collapse: collapse;
      background: #c67519;
      width: 100%;

      td {
        width: 2rem;
        height: 2rem;
        border: 1px solid black;
        position: relative;
        box-sizing: border-box;

        span {
          width: 80%;
          height: 80%;
          border-radius: 50%;
          position: absolute;
          top: 10%;
          left: 10%;
          cursor: pointer;
        }
        .on {
          border: 1px solid red;
        }
      }
    }
  }

  .chat {
    .chatInput {
      position: relative;

      .q-btn {
        position: absolute;
        right: 0;
        top: 20%;
      }
    }
  }
}
</style>
