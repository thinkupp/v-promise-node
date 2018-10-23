CREATE TABLE `users` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `lastLoginTime` int(11) DEFAULT NULL COMMENT '上次登录时间',
  `registerTime` int(11) DEFAULT NULL COMMENT '注册时间',
  `nickname` varchar(64) DEFAULT NULL COMMENT '昵称',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像地址',
  `gender` varchar(1) DEFAULT NULL COMMENT '性别',
  `inviteBy` int(10) DEFAULT NULL COMMENT '邀请人',
  `ban` tinyint(1) DEFAULT false COMMENT '是否禁止登录',
  `phone` varchar(11) DEFAULT NULL COMMENT '手机号',
  `openid` varchar(28) NOT NULL COMMENT 'OpenID',
  `unionid` varchar(29) DEFAULT NULL COMMENT 'unionID',
  `systemInfo` blob DEFAULT NULL COMMENT '手机信息',
  `scene` int(10) DEFAULT NULL COMMENT '注册场景',
  `region` varchar(30) DEFAULT NULL COMMENT '地区',
  `loginNumber` int(10) DEFAULT 0 COMMENT '登录次数',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1000000 DEFAULT CHARSET=utf8 COMMENT='用户表';

CREATE TABLE `session_keys` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `user_id` int(10) NOT NULL,
  `session_key` varchar(24) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `appoint` (
 `id` int(10) NOT NULL AUTO_INCREMENT,
 `createTime` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
 `updateTime` int(11) DEFAULT NULL COMMENT '最后修改时间',
 `finishTime` int(11) DEFAULT NULL COMMENT '完成时间',
 `images` blob DEFAULT NULL COMMENT '图片列表',
 `watcherMax` smallint(3) NOT NULL DEFAULT 0 COMMENT '监督者上限, 0不限制',
 `watcherNumber` smallint(3) DEFAULT 0 COMMENT '监督者数量',
 `accessNumber` smallint(6) DEFAULT 0 COMMENT '访问量',
 `visitNumber` smallint(6) DEFAULT 0 COMMENT '浏览人次',
 `startTime` int(10) NOT NULL COMMENT '开始时间',
 `endTime` int(10) NOT NULL COMMENT '结束时间',
 `onlookers` tinyint(1) DEFAULT 1 COMMENT '是否允许围观',
 `private` tinyint(1) DEFAULT 0 COMMENT '是否为私密',
 `effectiveTime` smallint(3) NOT NULL COMMENT '有效时间',
 `autoCreate` varchar(10) NOT NULL COMMENT '自动创建',
 `type` varchar(10) NOT NULL COMMENT '类型',
 `creatorId` int(10) NOT NULL COMMENT '创建者ID',
 `des` varchar(255) DEFAULT '' COMMENT '描述',
 `title` varchar(20) DEFAULT '' COMMENT '标题',
 `deleted` tinyint(1) DEFAULT 0 COMMENT '删除状态',
 `support` smallint(5) DEFAULT 0 COMMENT '支持数',
 `unSupport` smallint(5) DEFAULT 0 COMMENT '反对数',
 `comment` smallint(5) DEFAULT 0 COMMENT '评论数',
 `isSupport` tinyint(1) DEFAULT NULL COMMENT '是否支持'
 PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=100000 DEFAULT CHARSET=utf8;

CREATE TABLE `visit` (
`id` int(10) NOT NULL AUTO_INCREMENT,
`createTime` datetime DEFAULT CURRENT_TIMESTAMP,
`appointId` int(10) NOT NULL COMMENT '访问的id',
`userId` int(10) NOT NULL COMMENT '访问者id',
`lastVisitTime` int(11) NOT NULL COMMENT '最后一次访问时间',
`visitNumber` smallint(5) DEFAULT 1 COMMENT '访问次数',
 PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='访问记录表';

CREATE TABLE `watcher` (
`id` int(10) NOT NULL AUTO_INCREMENT,
`createTime` datetime DEFAULT CURRENT_TIMESTAMP,
`appointId` int(10) NOT NULL,
`userId` int(10) NOT NULL,
`shareBy` int(10) DEFAULT NULL COMMENT `邀请人`,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `comments` (
`id` int(10) NOT NULL AUTO_INCREMENT,
`createTime` datetime DEFAULT CURRENT_TIMESTAMP,
`appointId` int(10) NOT NULL,
`userId` int(10) NOT NULL,
`content` varchar(255) NOT NULL,
`parise` smallint(5) DEFAULT 0 COMMENT '得赞数',
`ban` tinyint(1) DEFAULT 0 COMMENT '禁止显示',
`tipOffs` smallint(5) DEFAULT 0 COMMENT '举报数',
`reply` varchar(255) DEFAULT NULL COMMENT '回复者',
 PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=100000 DEFAULT CHARSET=utf8;

CREATE TABLE `support` (
`id` int(10) NOT NULL AUTO_INCREMENT,
`createTime` datetime DEFAULT CURRENT_TIMESTAMP,
`support` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否支持',
`appointId` int(10) NOT NULL,
`userId` int(10) NOT NULL,
PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;