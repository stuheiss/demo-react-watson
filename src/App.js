import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'

import recognizeMicrophone from 'watson-speech/speech-to-text/recognize-microphone'

const eliza = require('./elizabot.js')

// use port 3002
const SPEECH_TO_TEXT_API = 'http://localhost:3002/api/speech-to-text/token'

class App extends Component {
  constructor() {
    super()
    this.state = {
      text: '',
      elizaListening: false,
      elizaSay: ''
    }
  }
  onElizaGreetClick() {
    const greeting = eliza.start()
    this.setState({
      elizaSay: greeting,
      elizaListening: true
    })
  }
  onElizaByeClick() {
    const greeting = eliza.bye()
    this.setState({
      elizaSay: greeting,
      elizaListening: false
    })
  }
  elizaRespond(transcript) {
    const response = eliza.reply(transcript)
    if (eliza.quit()) {
      this.setState({
        elizaSay: response,
        elizaListening: false
      })
    } else {
      this.setState({
        elizaSay: response
      })
    }
  }
  elizaQuiet() {
    this.setState({
      elizaSay: ''
    })
  }
  onPauseClick() {
    this.setState({
      text: 'zzz...',
      final: false
    })
  }
  onListenClick() {
    this.setState({
      text: 'waiting...'
    })
    fetch(SPEECH_TO_TEXT_API)
      .then(response => {
        return response.text()
      })
      .then(token => {
        var stream = recognizeMicrophone({
          token: token,
          objectMode: true, // send objects instead of text
          extractResults: true, // convert {results: [{alternatives:[...]}], result_index: 0} to {alternatives: [...], index: 0}
          format: false // optional - performs basic formatting on the results such as capitals an periods
        })
        stream.on('data', data => {
          const transcript = data.alternatives[0].transcript
          const final = data.final
          if (final) {
            if (this.state.elizaListening) {
              this.elizaRespond(transcript)
            } else if (this.state.elizaSay) {
              this.elizaQuiet()
            }
          }
          this.setState({
            text: transcript,
            final: final
          })
        })
        stream.on('error', err => {
          console.log('err', err)
        })
        document.querySelector('#stop').onclick = stream.stop.bind(stream)
      })
      .catch(error => {
        console.log(error)
      })
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          Click Transcribe to start listening, Pause to suspend, Hello Eliza to
          start analysis, Goodbye Eliza to end your session.
        </p>
        <button onClick={this.onElizaGreetClick.bind(this)}>Hello Eliza</button>
        <button onClick={this.onElizaByeClick.bind(this)}>Goodbye Eliza</button>
        <button onClick={this.onListenClick.bind(this)}>Transcribe</button>
        <button id="stop" onClick={this.onPauseClick.bind(this)}>
          Pause
        </button>
        <div>{this.state.elizaSay}</div>
        <div style={{ fontSize: '48px' }}>{this.state.text}</div>
      </div>
    )
  }
}

export default App
