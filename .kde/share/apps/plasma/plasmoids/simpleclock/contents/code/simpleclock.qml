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


Item {
  id: mainWidget
  ClockWidget {
    id: clock
    timeformat: "hh:mm"
    dateformat: "yyyy-MM-dd hh:mm"
    height: mainWidget.height
  }
  
  PlasmaCore.ToolTip {
    target: mainWidget
    mainText: i18n("Current time")
    subText: clock.time
    image: "clock"
  }
}