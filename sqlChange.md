[change]:
appoint ->
    accessNumber: access smallint 5
    visitNumber: visit smallint 5

visit ->
    visitNumber: number

[create]:
    error_log
    comment_like

// old

[change];
appoint ->
    delete `autoCreate` varchar(10) NOT NULL COMMENT '自动创建'

[create]:
    access_record