// -*- coding: iso-8859-1 -*-
/*
 *   Author: CSSlayer <wengxt@gmail.com>
 *   Date: 周四 6月 23 2011, 00:09:21
 *
 *   This program is free software; you can redistribute it and/or modify
 *   it under the terms of the GNU Library General Public License as
 *   published by the Free Software Foundation; either version 2 or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details
 *
 *   You should have received a copy of the GNU Library General Public
 *   License along with this program; if not, write to the
 *   Free Software Foundation, Inc.,
 *   51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

import QtQuick 1.0
import org.kde.plasma.graphicswidgets 0.1 as PlasmaWidgets
import org.kde.plasma.core 0.1 as PlasmaCore
import org.kde.plasma.graphicslayouts 4.7 as GraphicsLayouts

QGraphicsWidget {
  id: widget;
  property string timeformat
  property string dateformat
  property string time

  Item {
      id: clock
      
      height: widget.height
      
      property int hours
      property int minutes
      property int seconds
      property alias text: clockText.text
      property alias timeformat: widget.timeformat
      property alias dateformat: widget.dateformat
      
      function timeChanged() {
        var date = new Date;
        hours = date.getHours()
        minutes = date.getMinutes()
        seconds = date.getSeconds();
        text = this.formatDate(date, this.timeformat);
        widget.time = this.formatDate(date, this.dateformat);
      }
      
      function formatDate(date, format)
      {
        var o = {
          "M+" : date.getMonth()+1, //month
          "d+" : date.getDate(),    //day
          "h+" : date.getHours(),   //hour
          "m+" : date.getMinutes(), //minute
          "s+" : date.getSeconds(), //second
          "q+" : Math.floor((date.getMonth()+3)/3),  //quarter
          "S" : date.getMilliseconds() //millisecond
        }
        if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
          (date.getFullYear()+"").substr(4 - RegExp.$1.length));
        for(var k in o)if(new RegExp("("+ k +")").test(format))
          format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
        return format; 
      }
      
      Timer {
          interval: 1000; running: true; repeat: true;
          onTriggered: clock.timeChanged()
      }

      PlasmaWidgets.Label {
        id: clockText;
        font.pixelSize: widget.height * 0.7;
        height: widget.height;
        width: widget.width * text.length / 2;
        text: text
      }
  }

}