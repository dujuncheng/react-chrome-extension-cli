import React, {Component} from 'react';
import { Button, Select, message } from "antd";
const { Option } = Select;
const axios = require('axios');
import { INIT_RESULT } from '../constant/index.js'

const HOME_URL = "https://www.baidu.com";

// 跳转连接
function jumpPage () {
	chrome.tabs.create({ url: HOME_URL });
}

class Demo extends Component {
	constructor() {
		super();
		this.fetchData = this.fetchData.bind(this)
		this.handleAdd = this.handleAdd.bind(this)
		this.handleSub = this.handleSub.bind(this)
		this.handleSuccess = this.handleSuccess.bind(this)
		this.handleError = this.handleError.bind(this)
		this.state = {
			result: INIT_RESULT,
			remoteData: '',
		}
	}
	componentDidMount() {
		// 测试 调用 ajax
		this.fetchData();
	}
	handleError() {
		message.error('接口请求失败');
	}
	handleSuccess() {
		message.success('接口请求成功');
	}
	
	fetchData() {
		let that = this;
		//  先检查登录状态
		axios({
			method: 'get',
			url: HOME_URL,
		}).then(function (res) {
			console.log(res)
			// 登录状态有效
			if (res && Number(res.status) == 200) {
				that.handleSuccess()
			} else {
				that.handleError()
			}
		}).catch(function (e) {
			that.handleError()
		})
	}
	
	handleAdd() {
		this.setState((state) => {
			return {
				result: state.result + 1
			}
		})
	}
	handleSub() {
		this.setState((state) => {
			return {
				result: state.result - 1
			}
		})
	}
	render() {
		let { remoteData, result} = this.state;
		
		return (
			<div className="App">
				<div className="content">
					<Button onClick={this.handleAdd}>增加</Button>
					<Button onClick={this.handleSub}>减少</Button>
				</div>
				<div className="result">{result}</div>
				<Button className="btn" onClick={jumpPage}>点我跳转 百度</Button>
			</div>
		);
	}
}

export default Demo;
