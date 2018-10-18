CREATE TABLE `users` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `uid` varchar(33) NOT NULL,
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `lastLoginTime` datetime DEFAULT NULL COMMENT '上次登录时间',
  `registerTime` datetime DEFAULT NULL COMMENT '注册时间',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `session_keys` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `openid` varchar(28) NOT NULL,
  `session_key` varchar(24) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
