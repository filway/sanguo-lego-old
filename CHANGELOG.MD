# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 2025-03-20

### Added
- 将老版本一些未提交的commit整合到这个项目里面 (包含canvg引入, ios移动端刷新404, 提交后显示二维码等功能)

## 2025-03-17

### Added
- 编辑页面新增新字体的下拉选择
- 首页分页按钮改为浮动定位
- 首页温馨提示移到到分页按钮上方

## 2025-03-14

### Added
- 添加字体预加载功能，提高字体加载性能
- 添加新字体：'cn_regular'和'semibold1217'
- 在模板属性中添加设计理念、主色调、背景色、横版字体和竖版字体字段
- 改进横版和竖版布局的字体处理

### Changed
- 更新API基础URL至HTTPS端点(lgg.qiyuan3.cn)
- 将node-sass替换为sass模块
- 更新CSS深度选择器语法从/deep/到:deep()
- 首页'温馨提示'的背景颜色修改

### Fixed
- 修复TypeScript类型定义日志

## 2025-03-14
### Added
- 项目初始化，基于最老版本的项目进行迁移