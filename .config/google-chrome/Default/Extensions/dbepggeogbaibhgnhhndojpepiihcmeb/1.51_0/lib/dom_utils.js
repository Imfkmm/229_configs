// Generated by CoffeeScript 1.9.1
(function() {
  var DomUtils, root,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  DomUtils = {
    documentReady: function(func) {
      if (document.readyState === "loading") {
        return window.addEventListener("DOMContentLoaded", func);
      } else {
        return func();
      }
    },
    addElementList: function(els, overlayOptions) {
      var el, i, len, parent;
      parent = document.createElement("div");
      if (overlayOptions.id != null) {
        parent.id = overlayOptions.id;
      }
      if (overlayOptions.className != null) {
        parent.className = overlayOptions.className;
      }
      for (i = 0, len = els.length; i < len; i++) {
        el = els[i];
        parent.appendChild(el);
      }
      document.documentElement.appendChild(parent);
      return parent;
    },
    removeElement: function(el) {
      return el.parentNode.removeChild(el);
    },
    isTopFrame: function() {
      return window.top === window.self;
    },
    makeXPath: function(elementArray) {
      var element, i, len, xpath;
      xpath = [];
      for (i = 0, len = elementArray.length; i < len; i++) {
        element = elementArray[i];
        xpath.push(".//" + element, ".//xhtml:" + element);
      }
      return xpath.join(" | ");
    },
    evaluateXPath: function(xpath, resultType) {
      var contextNode, namespaceResolver;
      contextNode = document.webkitIsFullScreen ? document.webkitFullscreenElement : document.documentElement;
      namespaceResolver = function(namespace) {
        if (namespace === "xhtml") {
          return "http://www.w3.org/1999/xhtml";
        } else {
          return null;
        }
      };
      return document.evaluate(xpath, contextNode, namespaceResolver, resultType, null);
    },
    getVisibleClientRect: function(element, testChildren) {
      var child, childClientRect, clientRect, clientRects, computedStyle, i, j, len, len1, ref;
      if (testChildren == null) {
        testChildren = false;
      }
      clientRects = (function() {
        var i, len, ref, results;
        ref = element.getClientRects();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          clientRect = ref[i];
          results.push(Rect.copy(clientRect));
        }
        return results;
      })();
      for (i = 0, len = clientRects.length; i < len; i++) {
        clientRect = clientRects[i];
        if ((clientRect.width === 0 || clientRect.height === 0) && testChildren) {
          ref = element.children;
          for (j = 0, len1 = ref.length; j < len1; j++) {
            child = ref[j];
            computedStyle = window.getComputedStyle(child, null);
            if (computedStyle.getPropertyValue('float') === 'none' && computedStyle.getPropertyValue('position') !== 'absolute') {
              continue;
            }
            childClientRect = this.getVisibleClientRect(child, true);
            if (childClientRect === null || childClientRect.width < 3 || childClientRect.height < 3) {
              continue;
            }
            return childClientRect;
          }
        } else {
          clientRect = this.cropRectToVisible(clientRect);
          if (clientRect === null || clientRect.width < 3 || clientRect.height < 3) {
            continue;
          }
          computedStyle = window.getComputedStyle(element, null);
          if (computedStyle.getPropertyValue('visibility') !== 'visible') {
            continue;
          }
          return clientRect;
        }
      }
      return null;
    },
    cropRectToVisible: function(rect) {
      var boundedRect;
      boundedRect = Rect.create(Math.max(rect.left, 0), Math.max(rect.top, 0), rect.right, rect.bottom);
      if (boundedRect.top >= window.innerHeight - 4 || boundedRect.left >= window.innerWidth - 4) {
        return null;
      } else {
        return boundedRect;
      }
    },
    getClientRectsForAreas: function(imgClientRect, areas) {
      var area, coords, diff, i, len, r, rect, rects, ref, shape, x, x1, x2, y, y1, y2;
      rects = [];
      for (i = 0, len = areas.length; i < len; i++) {
        area = areas[i];
        coords = area.coords.split(",").map(function(coord) {
          return parseInt(coord, 10);
        });
        shape = area.shape.toLowerCase();
        if (shape === "rect" || shape === "rectangle") {
          x1 = coords[0], y1 = coords[1], x2 = coords[2], y2 = coords[3];
        } else if (shape === "circle" || shape === "circ") {
          x = coords[0], y = coords[1], r = coords[2];
          diff = r / Math.sqrt(2);
          x1 = x - diff;
          x2 = x + diff;
          y1 = y - diff;
          y2 = y + diff;
        } else if (shape === "default") {
          ref = [0, 0, imgClientRect.width, imgClientRect.height], x1 = ref[0], y1 = ref[1], x2 = ref[2], y2 = ref[3];
        } else {
          x1 = coords[0], y1 = coords[1], x2 = coords[2], y2 = coords[3];
        }
        rect = Rect.translate(Rect.create(x1, y1, x2, y2), imgClientRect.left, imgClientRect.top);
        rect = this.cropRectToVisible(rect);
        if (rect && !isNaN(rect.top)) {
          rects.push({
            element: area,
            rect: rect
          });
        }
      }
      return rects;
    },
    isSelectable: function(element) {
      var unselectableTypes;
      unselectableTypes = ["button", "checkbox", "color", "file", "hidden", "image", "radio", "reset", "submit"];
      return (element.nodeName.toLowerCase() === "input" && unselectableTypes.indexOf(element.type) === -1) || element.nodeName.toLowerCase() === "textarea" || element.isContentEditable;
    },
    isEditable: function(element) {
      var nodeName, ref, ref1;
      if (element.isContentEditable) {
        return true;
      }
      nodeName = (ref = element.nodeName) != null ? ref.toLowerCase() : void 0;
      if (nodeName === "input" && ((ref1 = element.type) !== "radio" && ref1 !== "checkbox")) {
        return true;
      }
      return nodeName === "textarea" || nodeName === "select";
    },
    isEmbed: function(element) {
      var ref, ref1;
      return (ref = (ref1 = element.nodeName) != null ? ref1.toLowerCase() : void 0) === "embed" || ref === "object";
    },
    isFocusable: function(element) {
      return this.isEditable(element) || this.isEmbed(element);
    },
    isDOMDescendant: function(parent, child) {
      var node;
      node = child;
      while (node !== null) {
        if (node === parent) {
          return true;
        }
        node = node.parentNode;
      }
      return false;
    },
    isSelected: function(element) {
      var containerNode, node, selection;
      selection = document.getSelection();
      if (element.isContentEditable) {
        node = selection.anchorNode;
        return node && this.isDOMDescendant(element, node);
      } else {
        if (selection.type === "Range" && selection.isCollapsed) {
          containerNode = selection.anchorNode.childNodes[selection.anchorOffset];
          return element === containerNode;
        } else {
          return false;
        }
      }
    },
    simulateSelect: function(element) {
      if (element === document.activeElement && DomUtils.isEditable(document.activeElement)) {
        return handlerStack.bubbleEvent("click", {
          target: element
        });
      } else {
        element.focus();
        try {
          if (element.selectionStart === 0 && element.selectionEnd === 0) {
            return element.setSelectionRange(element.value.length, element.value.length);
          }
        } catch (_error) {}
      }
    },
    simulateClick: function(element, modifiers) {
      var event, eventSequence, i, len, mouseEvent, results;
      modifiers || (modifiers = {});
      eventSequence = ["mouseover", "mousedown", "mouseup", "click"];
      results = [];
      for (i = 0, len = eventSequence.length; i < len; i++) {
        event = eventSequence[i];
        mouseEvent = document.createEvent("MouseEvents");
        mouseEvent.initMouseEvent(event, true, true, window, 1, 0, 0, 0, 0, modifiers.ctrlKey, modifiers.altKey, modifiers.shiftKey, modifiers.metaKey, 0, null);
        results.push(element.dispatchEvent(mouseEvent));
      }
      return results;
    },
    flashRect: function(rect) {
      var flashEl;
      flashEl = document.createElement("div");
      flashEl.id = "vimiumFlash";
      flashEl.className = "vimiumReset";
      flashEl.style.left = rect.left + window.scrollX + "px";
      flashEl.style.top = rect.top + window.scrollY + "px";
      flashEl.style.width = rect.width + "px";
      flashEl.style.height = rect.height + "px";
      document.documentElement.appendChild(flashEl);
      return setTimeout((function() {
        return DomUtils.removeElement(flashEl);
      }), 400);
    },
    suppressPropagation: function(event) {
      return event.stopImmediatePropagation();
    },
    suppressEvent: function(event) {
      event.preventDefault();
      return this.suppressPropagation(event);
    },
    suppressKeyupAfterEscape: function(handlerStack) {
      return handlerStack.push({
        _name: "dom_utils/suppressKeyupAfterEscape",
        keyup: function(event) {
          if (!KeyboardUtils.isEscape(event)) {
            return true;
          }
          this.remove();
          return false;
        }
      });
    },
    simulateTextEntry: function(element, text) {
      var event;
      event = document.createEvent("TextEvent");
      event.initTextEvent("textInput", true, true, null, text);
      return element.dispatchEvent(event);
    },
    getElementWithFocus: function(selection, backwards) {
      var o, r, t;
      r = t = selection.getRangeAt(0);
      if (selection.type === "Range") {
        r = t.cloneRange();
        r.collapse(backwards);
      }
      t = r.startContainer;
      if (t.nodeType === 1) {
        t = t.childNodes[r.startOffset];
      }
      o = t;
      while (o && o.nodeType !== 1) {
        o = o.previousSibling;
      }
      t = o || (t != null ? t.parentNode : void 0);
      return t;
    },
    getCaretCoordinates: (function() {
      var properties;
      properties = ['direction', 'boxSizing', 'width', 'height', 'overflowX', 'overflowY', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'fontSizeAdjust', 'lineHeight', 'fontFamily', 'textAlign', 'textTransform', 'textIndent', 'textDecoration', 'letterSpacing', 'wordSpacing'];
      return function(element, position) {
        var computed, coordinates, div, i, len, prop, span, style;
        div = document.createElement("div");
        div.id = "vimium-input-textarea-caret-position-mirror-div";
        document.body.appendChild(div);
        style = div.style;
        computed = getComputedStyle(element);
        style.whiteSpace = "pre-wrap";
        if (element.nodeName.toLowerCase() !== "input") {
          style.wordWrap = "break-word";
        }
        style.position = "absolute";
        style.visibility = "hidden";
        for (i = 0, len = properties.length; i < len; i++) {
          prop = properties[i];
          style[prop] = computed[prop];
        }
        style.overflow = "hidden";
        div.textContent = element.value.substring(0, position);
        if (element.nodeName.toLowerCase() === "input") {
          div.textContent = div.textContent.replace(/\s/g, "\u00a0");
        }
        span = document.createElement("span");
        span.textContent = element.value.substring(position) || ".";
        div.appendChild(span);
        coordinates = {
          top: span.offsetTop + parseInt(computed["borderTopWidth"]),
          left: span.offsetLeft + parseInt(computed["borderLeftWidth"])
        };
        document.body.removeChild(div);
        return coordinates;
      };
    })(),
    textContent: (function() {
      var visitedNodes;
      visitedNodes = null;
      return {
        reset: function() {
          return visitedNodes = [];
        },
        get: function(element) {
          var node, nodes, text, texts;
          nodes = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
          texts = (function() {
            var results;
            results = [];
            while (node = nodes.nextNode()) {
              if (node.nodeType !== 3) {
                continue;
              }
              if (indexOf.call(visitedNodes, node) >= 0) {
                continue;
              }
              text = node.data.trim();
              if (!(0 < text.length)) {
                continue;
              }
              visitedNodes.push(node);
              results.push(text);
            }
            return results;
          })();
          return texts.join(" ");
        }
      };
    })()
  };

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.DomUtils = DomUtils;

}).call(this);
