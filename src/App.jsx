import React, {Component} from 'react';
import Navbar from './Nav.jsx'
import ChatBar from './ChatBar.jsx'
import MessageList from './MessageList.jsx'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: '', // optional. if currentUser is not defined, it means the user is Anonymous
      messages: [], // messages coming from the server will be stored here
      connectedClients: [],
      userID: ''
    };
  }

  componentDidMount() {
    this.socket = new WebSocket("ws://0.0.0.0:3001");
    this.socket.onmessage = (event) => {
      console.log("EVENTDATA", JSON.parse(event.data));
      let eventData = JSON.parse(event.data);
      // save unique userID to state
      this.setState({userID: eventData.userID});
      let tempMessages = this.state.messages;
      tempMessages.push(JSON.parse(event.data));
      console.log("EVENTDATA USERNAME", eventData.username);

      if (eventData.type === 'user' || eventData.type === 'system') {
        if (eventData.userID !== this.state.userID) {
          // only update messages NOT username!
          this.setState({messages: tempMessages});
          console.log("Im here!");
        }

        this.setState({
          // currentUser: eventData.username,
          messages: tempMessages
        });
      } else {
        // if eventData has connectedClients....
        if (eventData.connectedClients) {
          const connectedClients = JSON.parse(event.data);
          console.log("HEYHEYHEY", connectedClients);
          this.setState({connectedClients: eventData.connectedClients});
        }
      }
    }
  }

  changeUsername(newUsername) {
    console.log("NEWUSERNAME", newUsername);
    const previousName = this.state.currentUser;
    console.log("PREVIOUSNAME", previousName);
    this.setState({ currentUser: newUsername });

    const systemMessage = {
      type: 'system',
      content: `${previousName} changed name to  ${newUsername}`,
      username: newUsername
    };

    this.newMessage(systemMessage);
  }

  sendMessage(username, content) {
    if (username !== this.state.currentUser) {
      this.changeUsername(username);
    }

    let message = {
      type: 'user',
      content: content,
      username: username
    };

    this.newMessage(message);
    // this.setState({currentUser:username});
  }

  newMessage(message) {
    this.socket.send(JSON.stringify(message));
  }

  render() {
    return (
      <div>
      <Navbar connectedClients= {this.state.connectedClients.length} />
      <MessageList messages = {this.state.messages} />
      <ChatBar username= {this.state.currentUser}
      newMessage= {this.newMessage.bind(this)}
      sendMessage={this.sendMessage.bind(this)}
      changeUsername={this.changeUsername.bind(this)} />
      </div>
    );
  }
}

export default App;












