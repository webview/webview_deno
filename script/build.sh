#!/bin/sh

set -e

if [ "$(uname)" = "Darwin" ]; then
	c++ webview/webview.cc -dynamiclib -c -DWEBVIEW_COCOA -std=c++11 -Wall -Wextra -pedantic -framework WebKit -o build/libwebview.dylib
else
	c++ webview/webview.cc -c -DWEBVIEW_GTK -std=c++11 -Wall -Wextra -pedantic $(pkg-config --cflags --libs gtk+-3.0 webkit2gtk-4.0) -fpic -o build/webview.o
	c++ build/webview.o -shared -o build/libwebview.so
fi
