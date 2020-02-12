'use strict';

import './popup.css';
import React from "react";
import ReactDOM from "react-dom";
import "antd/dist/antd.css";

import Demo from './components/demo.js';


(function() {
  ReactDOM.render(
    <Demo></Demo>,
    document.getElementById("root")
  );
  
})();
