/*global window, document, wysiwyg */

export default class RichTexarea {

  constructor(wrapper, color, link) {
    this.color = color
    this.link = link
    this.wrapper = wrapper
    this.textarea = wrapper.querySelector('.form-rich')
    this.btns = this.wrapper.querySelectorAll('.wysiwyg-toolbar-icon')
    this.textEditor = wysiwyg({
      element: this.textarea,
      onKeyUp: () => {
        this.setHTML()
      },
      hijackContextmenu: false
    })

    this._action = this.action.bind(this)
    Array.prototype.forEach.call(this.btns, (btn) => {
      btn.addEventListener('click', this._action)
    })
  }

  setHTML() {
    this.textarea.innerHTML = this.textEditor.getHTML()
    var evt = document.createEvent('KeyboardEvent')
    evt.initKeyboardEvent('keyup', true, true, window, 0, 0, 0, 0, 0, 'e'.charCodeAt(0)) 
    this.textarea.dispatchEvent(evt)
  }

  _replaceSelectionWithHtml(html) {
    var range
    if (window.getSelection && window.getSelection().getRangeAt) {
      range = window.getSelection().getRangeAt(0)
      range.deleteContents()
      var div = document.createElement('div')
      div.innerHTML = html
      var frag = document.createDocumentFragment(), child
      while ( (child = div.firstChild) ) {
        frag.appendChild(child)
      }
      range.insertNode(frag)
    } else if (document.selection && document.selection.createRange) {
      range = document.selection.createRange()
      html = (node.nodeType == 3) ? node.data : node.outerHTML
      range.pasteHTML(html)
    }
  }

  action(e) {
    this.el = e.target
    if(this.el.tagName.toLowerCase() === 'span') this.el = this.el.parentNode

    this.action = this.el.getAttribute('data-action')
    this.popup = this.el.getAttribute('data-popup')
    this.param = this.el.getAttribute('data-param')
    if(typeof this.popup !== 'undefined' && this.popup !== null){
      var off
      switch(this.popup){
      case 'color':
        off = this.color.onColor((color) => {
          if(color !== null) {
            this.textEditor[this.action](color)
            this.setHTML()
          }
          off()
        })
        this.color.show(this.el)
        break
      case 'link':
        var html = this.textEditor.getHTML()
        this._replaceSelectionWithHtml(`<a href="[LINK]" target="[TARGET]" rel="[REL]">${window.getSelection().toString()}</a>`)
        off = this.link.onLink((obj) => {
          if(obj.link !== null) {
            html = this.textEditor.getHTML().replace('[LINK]', obj.link)
            if(obj.target) 		html = html.replace(/\[TARGET\]/, '_blank')
            else 							html = html.replace(/target=\"\[TARGET\]\"/, '')
            if(obj.noFollow) 	html = html.replace(/\[REL\]/, 'nofollow')
            else 							html = html.replace(/rel=\"\[REL\]\"/, '')
            this.textEditor.setHTML(html)
          }
          else this.textEditor.setHTML(html)
          this.setHTML()
          off()
        })
        this.link.show(this.el)
        break
      }
    }
    else if(this.action === 'code'){
      this._replaceSelectionWithHtml(`<pre><code>${window.getSelection().toString()}</code></pre>`)
      this.textEditor.setHTML(this.textEditor.getHTML())
      this.setHTML()
    }
    else{
      this.textEditor[this.action](this.param)
      this.setHTML()
    }

  }

}
