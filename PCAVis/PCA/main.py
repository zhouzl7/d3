#!/usr/bin/env python
# encoding: utf-8
"""
@author: zhouzl
@contact: zzl850783164@163.com
@software: 
@file: main.py
@time: 2020/11/26 19:31
@desc:
"""
import numpy as np
from PCA import PCA
import matplotlib.pyplot as plt
import json
import os

if __name__ == "__main__":
    images = np.load('./data/sampled_image.npy')
    labels = np.load('./data/sampled_label.npy')
    print(images.shape, labels.shape)
    images_reshape = images.reshape(images.shape[0], images.shape[1]*images.shape[2])
    print(images_reshape.shape)

    pca = PCA()
    pca.fit(images_reshape)
    data = pca.transform(2)

    dirs = './pic/'
    if not os.path.exists(dirs):
        os.makedirs(dirs)

    data_json = []
    for i in range(data.shape[0]):
        path = "./pic/{}.jpg".format(i)
        sample = [data[i][0].real, data[i][1].real, labels[i], path]
        data_json.append(sample)
        plt.imsave("./pic/%d.jpg" % i, images[i])
    with open("data.json", "w") as f:
        json.dump(data_json, f, indent=4)

