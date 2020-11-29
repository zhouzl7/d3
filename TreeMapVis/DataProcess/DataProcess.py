#!/usr/bin/env python
# encoding: utf-8
"""
@author: zhouzl
@contact: zzl850783164@163.com
@software: 
@file: DataProcess.py
@time: 2020/11/29 21:23
@desc:
"""
import json

if __name__ == "__main__":
    dataset = {}
    with open('China.json', encoding='utf-8') as f:
        info = json.load(f)['citylist']

    children = []
    dataset["name"] = "中国"
    dataset["children"] = children
    for p in info:
        data_p = {"name": p['p']}
        children_p = []
        if 'c' in p.keys():
            data_p["children"] = children_p
            for n in p['c']:
                data_n = {"name": n['n']}
                children_n = []
                if 'a' in n.keys():
                    data_n["children"] = children_n
                    for s in n['a']:
                        data_s = {"name": s['s'], "value": 1}
                        children_n.append(data_s)
                else:
                    data_n["value"] = 1
                children_p.append(data_n)
        else:
            data_p["value"] = 1
        children.append(data_p)

    with open("dataset.json", "w", encoding='utf-8') as f:
        json.dump(dataset, f, ensure_ascii=False, indent=4)
