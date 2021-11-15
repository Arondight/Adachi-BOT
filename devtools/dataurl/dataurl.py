#coding:utf-8

import json
import sys
import re
import base64
import platform
import os

def init(sysargs):
	if len(sysargs) < 2:
		print('参数不完整，无法执行')
		quit()
	for arg in sysargs:
		if re.search(r'\.json$', arg) is not None:
			json_path = arg
			html_module = re.search(r'aby|card|character|gacha|info|overview', arg).group(0)
		if re.search(r'^(aby|card|character|gacha|info|overview)$', arg) is not None:
			html_module = arg

	return json_path, html_module

def loadfile(jsonfile):
	with open(jsonfile, 'r', encoding='utf-8') as f:
		raw_data = json.load(f)
		raw_data = json.dumps(raw_data).encode('utf-8')
		f.close()

	return raw_data

def generateurl(html_page, raw_data):
	url_prefix = 'http://localhost:9934/src/views/genshin-' + html_page + '.html?data='
	data = base64.b64encode(raw_data).decode('utf-8')
	url = url_prefix + data

	return url

def openurl(url):
	userOS = platform.system()
	if userOS == 'Windows':
		cmd = 'start'
	elif userOS == 'Darwin':
		cmd = 'open'
	elif userOS == 'Linux':
		cmd = 'xdg-open'

	try:
		os.system(cmd + " " + url)
	except:
		print(url)

if __name__ == '__main__':
	jsonfile, html_page = init(sys.argv)
	data = loadfile(jsonfile)
	url = generateurl(html_page, data)
	openurl(url)