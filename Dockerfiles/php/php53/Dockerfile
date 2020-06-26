# # docker로 다나와 로컬 개발 서버 구성

# FROM centos:6
FROM centos:7.6.1810
# LABEL maintainer="joonwoo.kim <jwk@danawa.com>"

### 기본 패키지 설치
RUN yum update -y
RUN yum install -y vim wget gcc gcc-c++ make git && yum clean all

##########################################
### 언어설정 ###
##########################################
ENV DEV_ADOPTED_ENV DEVELOPER_PC
#ENV LANG ko_KR.utf8
ENV LANG ko_KR.euckr
ENV LC_ALL $LANG
ENV TZ Asia/Seoul
ENV EDITOR /usr/bin/vim
ENV ALTIBASE_HOME /etc/altibase

RUN localedef -f EUC-KR -i ko_KR ko_KR.euckr
RUN localedef -f UTF-8 -i ko_KR $LANG 
RUN ln -sf /usr/share/zoneinfo/$TZ /etc/localtime

RUN echo -e "LANG=\"$LANG\"" > /etc/sysconfig/i18n
RUN echo -e "#LANG=\"ko_KR.euckr\"" >> /etc/sysconfig/i18n
RUN echo -e "SYSFONT=\"latarcyrheb-sun16\"" >> /etc/sysconfig/i18n

# 로컬 개발 환경변수 설정
RUN echo -e "\n" >> /etc/profile
RUN echo -e "###############################" >> /etc/profile
RUN echo -e "# 추가 변수 설정 				#" >> /etc/profile
RUN echo -e "###############################" >> /etc/profile
RUN echo -e "export LC_ALL=\"${LC_ALL}\"" >> /etc/profile
RUN echo -e "export DEV_ADOPTED_ENV=\"${DEV_ADOPTED_ENV}\"" >> /etc/profile
RUN echo -e "export LANG=\"$LANG\"" >> /etc/profile
RUN echo -e "export EDITOR=\"${EDITOR}\"" >> /etc/profile
RUN echo -e "export ALTIBASE_HOME=\"${ALTIBASE_HOME}\"" >> /etc/profile

RUN mv /bin/vi /bin/vi_backup
RUN ln -sf /usr/bin/vim /bin/vi

RUN yum install -y \
        ImageMagick \
        libmcrypt \
        zlib-devel \
        openssl-devel \
        libxml2-devel \
        libcurl-devel \
        libjpeg-devel \
        libpng-devel \
        freetype-devel \
        t1lib-devel \
        libmcrypt-devel \
        readline-devel \
        gdbm-devel \
        bzip2-devel \
        ncurses-devel \
        libtool-ltdl-devel \
        epel-release \
        htop

### yum 패키지 설치 시 RPM-GPG-KEY 문제 해결
RUN rpm --import /etc/pki/rpm-gpg/RPM*

### MySQL 설치
# RUN yum install -y mysql.x86_64
RUN yum install -y mysql-devel.x86_64 mysql-libs.x86_64

### 아파치 설치
RUN yum install -y httpd httpd-devel httpd-tools mod_ssl

### PHP & 모듈설치
RUN yum install -y php.x86_64 \
        php-bcmath.x86_64 \
        php-cli.x86_64 \
        php-common.x86_64 \
        php-dba.x86_64 \
        php-devel.x86_64 \
        php-gd.x86_64 \
        php-imap.x86_64 \
        php-mbstring.x86_64 \
        php-mcrypt.x86_64 \
        php-mysql.x86_64 \
        php-odbc.x86_64 \
        php-pdo.x86_64 \
        php-pear.noarch \
        php-pecl-http.x86_64 \
        php-pecl-memcache.x86_64 \
        php-process.x86_64 \
        php-pspell.x86_64 \
        php-recode.x86_64 \
        php-snmp.x86_64 \
        php-soap.x86_64 \
        php-xml.x86_64 \
        php-xmlrpc.x86_64 \
        php-zts.x86_64

RUN yum clean all

# pear로 Predis1.0.4 설치(PHP5.3)
# PHP5.4 => Predis-1.1.1 설치하면 됨
RUN pear channel-discover pear.nrk.io
RUN pear install nrk/Predis-1.0.4


####################################
# rabbitmq-c 설치
####################################
WORKDIR /usr/local/src

COPY lib/rabbitmq-c-0.8.0.tar.gz .
RUN tar -zxvf rabbitmq-c-0.8.0.tar.gz
RUN ./rabbitmq-c-0.8.0/configure --prefix=/usr/local/rabbitmq-c
RUN make && make install
#RUN cd ../
RUN rm -rf rabbitmq-c-0.8.0
RUN rm -f rabbitmq-c-0.8.0.tar.gz

### amqp 직접 설치 방법
### 컨네이너에서 직접 설치 후 빌드
# pecl install amqp-1.8.0
## Set the path to librabbitmq install prefix [autodetect] : /usr/local/rabbitmq-c
### vi /etc/php.d/amqp.ini 파일 생성 후 아래 내용 등록
# extension=amqp.so
###
### rabbitmq & amqp 생성한 모듈 복사
COPY lib/amqp.so .
RUN mv amqp.so /usr/lib64/php/modules/
RUN chmod 755 /usr/lib64/php/modules/amqp.so
RUN echo "extension=amqp.so" > /etc/php.d/amqp.ini

############################################################
### alibase pdo driver 설치
#######################################################
## 1.0.6 설치 방법
# https://wiki.danawa.com/pages/viewpage.action?pageId=39651572
## 1.0.8 지라 이슈
# https://jira.danawa.com/browse/SERVER-12583
## 1.0.8 다운로드 방법 > 산출물 탭
# https://wiki.danawa.com/pages/viewpage.action?pageId=38876955

WORKDIR /usr/local/src

COPY lib/PDO_Driver_lib_6.5.1.7.1.tgz .
RUN tar -zxvf PDO_Driver_lib_6.5.1.7.1.tgz
RUN mkdir $ALTIBASE_HOME
RUN ln -sf /usr/local/src/PDO_Driver_lib_6.5.1.7.1/include_6.5.1.7.1/ \
        ${ALTIBASE_HOME}/include
RUN ln -sf /usr/local/src/PDO_Driver_lib_6.5.1.7.1/lib_6.5.1.7.1/ \
        ${ALTIBASE_HOME}/lib
### vi /etc/profile 에 아래 기입(위쪽에서 작성 완료)


COPY lib/PDO_ALTIBASE-1.0.8.tgz .
RUN pecl install ./PDO_ALTIBASE-1.0.8.tgz

### pdo_altibase 등록
### /usr/lib64/php/moduls 하위에 있음
RUN echo "extension=pdo_altibase.so" > /etc/php.d/pdo_altibase.ini

### php module 설치 확인
### $> php -m|grep -i alti

#################################
### openssl 인증서 파일 및 복사
##############################
RUN mkdir /etc/httpd/ssl
COPY ./ssl/* /etc/httpd/ssl/

# /home/danawa 심볼릭링크

#유저 생성 및 패스워드 추가 


# RUN adduser danawa --uid 1000
# RUN usermod -aG wheel danawa
# RUN yum install -y sudo 
# RUN echo 'danawa' | passwd danawa --stdin
# RUN echo 'danawa ALL=NOPASSWD: ALL' >> /etc/sudoers

# RUN mkdir -p /home/danawa/log

# COPY configure /home/danawa/configure
# RUN cp -R /home/danawa/configure/httpd/conf/* /etc/httpd/conf/
# RUN cp -R /home/danawa/configure/httpd/conf_d/* /etc/httpd/conf.d/
# RUN cp -R /home/danawa/configure/php/php/* /etc/
# RUN cp -R /home/danawa/configure/php/php_d/* /etc/php.d/

# WORKDIR /home/danawa

# RUN mkdir billing
# RUN mkdir dbfolder -p
# # COPY source/dbfolder dbfolder

# RUN pwd
# RUN ls -al
# ENV DEV_ADOPTED_ENV DEVELOPING_SERVER

# USER danawa
# #Code-Server 다운로드
# RUN mkdir -p /home/danawa/.cloud-ide
# WORKDIR /home/danawa/.cloud-ide
# RUN wget https://github.com/cdr/code-server/releases/download/3.4.1/code-server-3.4.1-linux-x86_64.tar.gz
# RUN tar -xzvf code-server-3.4.1-linux-x86_64.tar.gz
# RUN mv code-server-3.4.1-linux-x86_64 code-server

# # GIT 환경변수 
# ENV GIT_USERNAME "danawa"
# ENV GIT_USERMAIL "danawa@danawa.com"
# ENV GIT_REPO ""
# ENV GIT_CREDENTIALS ""

# #GIT 셋팅
# RUN git config --global credential.helper store

# # Code-Server Java Settings
# RUN /bin/bash -c "mkdir -p /home/danawa/.local/share/code-server/User/globalStorage/redhat.java"
# WORKDIR "/home/danawa/.local/share/code-server/User"
# RUN /bin/bash -c "touch settings.json"
# RUN /bin/bash -c "echo '{' >> settings.json"
# RUN /bin/bash -c "echo '    \"java.home\": \"/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.252.b09-2.el7_8.x86_64\",' >> settings.json"
# RUN /bin/bash -c "echo '    \"java.configuration.checkProjectSettingsExclusions\": false,' >> settings.json"
# RUN /bin/bash -c "echo '    \"java.semanticHighlighting.enabled\": true' >> settings.json"
# RUN /bin/bash -c "echo '}' >> settings.json"

# # SSH settings
# RUN sudo ssh-keygen -q -t dsa -f /etc/ssh/ssh_host_dsa_key -N "" 
# RUN sudo ssh-keygen -q -t rsa -f /etc/ssh/ssh_host_rsa_key -N "" 
# RUN sudo ssh-keygen -q -t ecdsa -f /etc/ssh/ssh_host_ecdsa_key -N "" 
# # RUN sudo ssh-keygen -q -t ed25519 -f /etc/ssh/ssh_host_ed25519_key -N ""

# RUN /bin/bash -c "mkdir -p /home/danawa/.ssh"
# WORKDIR /home/danawa/.ssh
# ENV RSA "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDFCcIM8Q/MtxSAvNWdQMAmH5MGoGV5BZGMvakneC+gVbvQzGF8vWHYJ/qYlZMi3kiIw1KVCrnuujzA+A/V0IPWwaepdq8hv/fDolRqNf6mubMjoWxbJuxgjCXnAs9AyiMkPuGRjKB3L2HOqGYV4cax3PgCLi9I0XHCQhgP0fla10h6Z31b67oR4pLEG24azdk3bGPIMkuBvAqODZk8ntG078nOLcaHJO21mp2k91+pRNob/O4/PIAulE+otvE+YfMfNqWqM6aHcayrueCR9U+5hkgoNTjCKm35PdxkXtmy4uzc5tw7t08f/Ur6Dg2ZkQLSp2lsa40+9FvB1u0JleRxTKPIf87Iwr65sWbZzULC1FMERmtmlT+CGroICGQDN2bkZztLPRBTo3v7GaTkLDUeVd4+zKAf9U44eGhWtsBL7ulgrcsWY1p2o21vqgheO7ovgIsm3JdBjJVgvSKAHCu+naipTClCKcRTEx6H1UuCJYKi1bCz0lmXcGVwZz1rAjs= admin@DA-PC-0484"
# ENV FOLDER "userProject"

# # 10000번 포트 / 22번 포트 사용
# #PORT 설정
# EXPOSE 80
# EXPOSE 443
# EXPOSE 8080
# EXPOSE 26379
# EXPOSE 6381
# EXPOSE 6100
# EXPOSE 10000
# EXPOSE 22


# # Code-Server php 패키지, git 패키지 설치 
# # RUN /bin/bash -c "sudo /home/danawa/.cloud-ide/code-server/bin/code-server --install-extension felixfbecker.php-pack --force"
# # RUN /bin/bash -c "sudo /home/danawa/.cloud-ide/code-server/bin/code-server --install-extension donjayamanne.git-extension-pack --force"

# COPY /index.php /home/danawa/project/
# WORKDIR /home/danawa/project

# RUN sudo chown danawa /home/danawa/project
# RUN sudo chgrp danawa /home/danawa/project

# WORKDIR /home/danawa/.ssh

# # 시작
# CMD /bin/bash -c "echo ${RSA} >> authorized_keys; \
#                     sudo /usr/sbin/sshd -D & \
#                     git config --global user.name ${GIT_USERNAME}; \
#                     git config --global user.email ${GIT_USERMAIL}; \
#                     mkdir -p /home/danawa/${FOLDER}; \
#                     cd /home/danawa/${FOLDER}; \
# 		            git init ; \
#                     git clone ${GIT_REPO}; \
# 		            cd ~ ; echo ${GIT_CREDENTIALS} >> .git-credentials ; \
#                     /home/danawa/.cloud-ide/code-server/bin/code-server --extensions-dir /home/danawa/.local/share/code-server/extensions --auth=none --bind-addr 0.0.0.0:10000;"
