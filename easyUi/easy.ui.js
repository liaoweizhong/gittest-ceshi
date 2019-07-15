!function(win,easyui){
	
	win.easyui = easyui();
	
}(window,function(){
	
	var easyui = function(id,param){
		return new easyui_element(id,param);
	};
	
	var easyui_element = function(id,param){
		this.dom = document.getElementById(id);
		if( !this.dom ) return console.log("id："+id+"不存在");
		this.domParent = this.dom.parentElement;
		this.param = param;
		//虚拟dom树
		this.virtualElementTree = [];
		this.init();
	}
	
	easyui_element.prototype = {
		
		init : function(){
			//对param参数的处理
			this.paramHandle();
			//对元素进行虚拟化处理
			this.virtualization();
		},
		//虚拟化dom处理
		virtualization : function(dom = this.dom,obj = this.virtualElementTree){
			var doms = Array.prototype.slice.apply(dom.children);
			for( var i = 0 ; i < doms.length ; i++ ){
				var domi = doms[i];
				obj.push({
					dom : domi,
					children : this.virtualization(domi,[]),
					//对虚拟化dom进行数据
					innerHTML : this.activation(domi)
				});
			};
			return obj;
		},
		//对param参数的处理
		paramHandle : function(){
			var param = this.param;
			//处理特殊的双向绑定函数
			this.responseField(param.data);
		},
		//对dom进行活性化处理  主要处理各种配置项
		activation : function(element){
			//处理内部带有编码的element
// 			var dom = element || this.dom;
// 			var doms = Array.prototype.slice.apply(dom.children);
			// for( var i in doms ){
			var domsi = element;
			//获取所有的元素属性
			var attr = Array.prototype.slice.apply(domsi.attributes).map(function(e){ return e.name; });
			//返回的活性化后的element
			var retDom = null;
			//在元素属性中查询easy配置属性
			attr = attr.forEach(function(e){ 
				if( e.indexOf(":") == 0 ) { 
					//处理html配置
					retDom = this.attributesDocs(e,domsi) ;
				}; 
			}.bind(this));
			// }
			return retDom;
		},
		//将数据双向绑定话
		responseField : function(data){
			//将数据
			data.__data__ = {};
			//变化中
			// this.onchange = new events();
			//变化之后
			data.onchangeEnd = new events();
			for( let i in data ){
				if( i == "__data__" ){ break; }
				data.__data__[i] = data[i];
				data[i] = null;
				Object.defineProperty(data,i,{
					get : function(){ return this.__data__[i]; },
					set : function( value ){
						// this.onchange(value,this.__data__[i]);
						this.__data__[i] = value;
						this.onchangeEnd(i,value);
					}
				});
			}
		},
		//给data值注册响应事件提供订阅
		subscription : function(name,fn,dom){
			this.param.data.__function__.push({name:name,fn:fn,dom:dom});
		},
		//属性配置响应
		attributesDocs : function(attrname,dom){
			var doms = null;
			if( attributesDocs[attrname] ) {
				//开始渲染
				doms = attributesDocs[attrname].call(this,dom);
			}
			return doms;
		},
	};
	
	var virtualElement = function(dom){
		this.dom = dom;
	}
	virtualElement.prototype = {
		attributesHandle : function(){
			var domsi = this.dom;
			//获取所有的元素属性
			var attr = Array.prototype.slice.apply(domsi.attributes).map(function(e){ return e.name; });
			//在元素属性中查询easy配置属性
			attr = attr.forEach(function(e){ e.indexOf(":e-") == 0 ? attributesDocs[e](domsi) : null ; }.bind(this));
		}
	}
	
	var attributesDocs = {
		":for" : function(dom){
		 	var attr = dom.getAttribute(":for");
			var id = parseInt(Math.random()*10000000);
			dom.setAttribute("e-data-id",id);
			attr = attr.replace(/\s{2,}/g," ").replace(/^\s|\s$/g,"").split(" ");
			if( attr[1] !== "in" ) return;
			//获取绑定的值
			eval( "var "+attr[2]+" = this.param.data[attr[2]];" );
			var dataname = this.param.data[attr[2]];
			if( !dataname ) return;
			//生成html
			var html = "";
			for( var i in dataname ){
				eval( "var "+attr[0]+" = dataname[i];" );
				eval( "html+=`"+dom.outerHTML+"`" );
				eval( "var "+attr[0]+" = null;" );
			}
			eval( "var "+attr[2]+" = null;" );
			dom.outerHTML = html;
			return html;
		},
		":eval" : function(dom){
			var _self = this;
			var html = dom.outerHTML;
			var data = this.param.data.__data__;
			for( var i in data )
				eval( "var "+i+" = '"+ data[i] +"';");
			eval("html =`"+ html +"`");
			dom.outerHTML = html;
			return html;
		}
	}
	
	//事件生成器
	var events = function(func){
		var data = [];
		var retFunc = func;
		var ret = function(func,bool){
			if(typeof func === "function" && !bool){
				data.push(func);
				func.remove = function(){
					data.splice(data.indexOf(func),1);
					return this;
				}
				func.setIndex = function(index){
					this.index = index;
					return this;
				}
				func.index = 0;
				ret.onaddFunction && ret.onaddFunction(func);
				return func;
			}
			retFunc && retFunc.apply(this,arguments);
			data.sort(function(a,b){ return a.index < b.index });
			for( var i = 0 ; i < data.length; i++ ){
				var it = data[i];
				it && ( it.apply(this,arguments) === 'remove' ) && it.remove();	
				ret.ontrigger && ret.ontrigger(it);
				if( data.indexOf(it) == -1 ) --i;
			};
		}
		ret.remove = function(){
			data = [];
		};
		ret.getFunction = function(){ 
			return data; 
		}
		ret.onaddFunction = null;
		ret.ontrigger = null;
		return ret;
	}
	
	//select初始化
	var selectInit = function(){
		var data = [
			{ value : "111" , text : "1111s" },
			{ value : "112" , text : "1112s" },
			{ value : "113" , text : "1113s" },
			{ value : "114" , text : "1114s" },
			{ value : "115" , text : "1115s" },
		]
		
		var selects = document.getElementById("select");
		selects.addEventListener("blur",function(){
			setTimeout(function(){
				this.selectDom.remove();
				this.selectDom = null;
			}.bind(this),100)
		})
		
		selects.addEventListener("focus",function(){
			createModel({input: this});
		})
		
		//生成选择模板
		var createModel = function(param){
			//确定好需要编辑的input;
			var input = param.input;
			if( input.selectDom ){
				return;
			}
			var width = input.offsetWidth;
			var div = document.createElement("div");
			var html = "";
			for( var i in data ){
				html += `<div easy-option-click value='${data[i].value}'>${data[i].text}</div>`;
			}
			div.className = "easyui_select_menu"
			div.innerHTML = html;
			div.style.width = width+"px";
			div.addEventListener("click",function(e){
				var attr = e.target;
				var f = attr.getAttribute("easy-option-click");
				if( f !== null ){
					input.value = attr.innerText;
					input.values = attr.getAttribute("value");
				}
			})
			input.after(div);
			input.selectDom = div;
		}
	}
	
	return easyui;
	
})