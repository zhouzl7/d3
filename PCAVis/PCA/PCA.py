#!/usr/bin/env python
# encoding: utf-8
"""
@author: zhouzl
@contact: zzl850783164@163.com
@software: 
@file: PCA.py
@time: 2020/11/26 16:21
@desc:
"""
import numpy as np
import matplotlib.pyplot as plt
import json


def pca(data, target_dimension):
    pass


if __name__ == "__main__":
    images = np.load('sampled_image.npy')
    labels = np.load('sampled_label.npy')
    print(images.shape, labels.shape)
    images_reshape = images.reshape(images.shape[0], images.shape[1]*images.shape[2])
    print(images_reshape.shape)