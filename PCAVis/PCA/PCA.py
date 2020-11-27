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


class PCA:
    def __init__(self):
        self.data = None
        self.cov_matrix = None
        self.cov_eigenvalues = None
        self.decreasing_index = None
        self.cov_feature_vector = None
        self.sample_n = 0
        self.sample_dim = 0

    def fit(self, data):
        """
        pca fit.
        :param data: numpy.array (sample_n, sample_dim)
        :return:
        """

        sample_n, sample_dim = data.shape
        self.data = np.empty(shape=(sample_n, 0))

        # 确保归一化时除数不为0
        for col_index in range(sample_dim):
            if np.max(data[:, col_index] != np.min(data[:, col_index])):
                self.data = np.column_stack((self.data, data[:, col_index]))
        # 归一化
        data_min = np.min(self.data, axis=0, keepdims=True)
        data_max = np.max(self.data, axis=0, keepdims=True)
        self.data = (self.data - data_min) / (data_max - data_min)
        self.sample_n, self.sample_dim = self.data.shape
        # 协方差矩阵
        self.cov_matrix = np.dot(self.data, self.data.T)
        # 协方差矩阵的特征值和特征向量
        self.cov_eigenvalues, self.cov_feature_vector = np.linalg.eig(self.cov_matrix)
        # 特征值从大到小的索引列表
        self.decreasing_index = np.argsort(-self.cov_eigenvalues)

    def transform(self, target_dim):
        """
        pca transform.
        :param target_dim: int.  pac target dimension
        :return: numpy.array (sample_n, target_dim)
        """
        # 将特征向量按对应特征值从大到小按行排列成矩阵，取前 target_dim(k) 行组成矩阵 P
        top_k_index = self.decreasing_index[:target_dim]
        top_k_eigenvalues = self.cov_eigenvalues[top_k_index]
        top_k_FV = self.cov_feature_vector[:, top_k_index]
        top_k_FV = np.dot(self.data.T, top_k_FV)
        top_k_FV = top_k_FV / (self.sample_n * top_k_eigenvalues.reshape(-1, target_dim)) ** 0.5
        # 降维结果
        data_transformed = np.dot(self.data, top_k_FV)
        return data_transformed

    def fit_transform(self, data, target_dim):
        """
        pca fit and then transform.
        :param data: numpy.array (sample_n, sample_dim)
        :param target_dim: int.  pac target dimension
        :return: numpy.array (sample_n, target_dim)
        """
        self.fit(data)
        return self.transform(target_dim)


