###################################################################
### docker 개발 서버 구성
### PHP:fpm 7.4

### PHP 관련 디렉토리
# /usr/local/bin/php
# /usr/local/etc/php
# /usr/local/etc/php/conf.d
# /usr/local/lib/php/extensions/no-debug-non-zts-20190902
####################################################################
# FROM php:7.4-fpm
# LABEL maintainer="kangbk35 <kbk35@danawa.com>"
FROM php:7.4-apache

ENV SHELL=/bin/bash

RUN apt-get update -y && apt upgrade -y \
    && ( \
    apt-get install -y \
        build-essential \
        vim htop procps net-tools iputils-ping \
        curl automake gcc make cmake locales libx11-dev \
        libxext-dev software-properties-common wget \
        imagemagick apt-utils \
        libcurl4-openssl-dev \
        libfreetype6-dev \
        libjpeg62-turbo-dev \
        libmcrypt-dev \
        libpng-dev \
        zlib1g-dev \
        libxml2-dev \
        libzip-dev \
        libonig-dev \
        libsqlite3-dev \
        libssh-dev \
        libssl-dev \
        libedit-dev \
        libreadline-dev \
        libsodium-dev \
        git \
        graphviz \
        g++ \
        libicu-dev \
        libmagickwand-dev \
        pkg-config \
        ssh-client \
        supervisor ) \
    && apt-get clean all


### 언어설정 (UTF-8) ############################################
### 참고 : https://www.44bits.io/ko/post/setup_linux_locale_on_ubuntu_and_debian_container

ENV LANG ko_KR.UTF-8
ENV LC_ALL $LANG
ENV TZ Asia/Seoul

RUN echo "\nko_KR.EUC-KR EUC-KR" >> /etc/locale.gen \
    && echo "${LANG} UTF-8" >> /etc/locale.gen \
    && locale-gen \
    && ln -sf /usr/share/zoneinfo/${TZ} /etc/localtime


### php module 설치 #############################################
RUN docker-php-ext-install \
    bcmath \
    calendar ctype curl \
    dba dom \
    exif fileinfo \
    gd gettext \
    iconv \
    json \
    mbstring mysqli \
    opcache \
    pdo pdo_mysql pdo_sqlite phar posix \
    readline session shmop simplexml soap sockets sodium \
    tokenizer \
    xml xmlrpc \
    zend_test

### php 컴포저 설치 #############################################################
RUN curl https://getcomposer.org/installer > composer-setup.php \
    && php composer-setup.php \
    && mv composer.phar /usr/local/bin/composer \
    && rm -f composer-setup.php

### pear로 Predis 설치 #####################################################
RUN pear channel-discover pear.nrk.io \
    && pear install nrk/Predis


### rabbitmq & amqp 설치 ################################################################
RUN apt-get install -y librabbitmq-dev \
    && pecl install amqp \
    && docker-php-ext-enable amqp

WORKDIR /usr/local/etc/php

RUN apt-get update -y && apt upgrade -y \
    && ( apt-get -y install \
        apt-utils vim htop procps \
        net-tools iputils-ping \
        locales \
    ) \
    && apt-get clean all

### 언어설정 (UTF-8) ############################################
### 참고 : https://www.44bits.io/ko/post/setup_linux_locale_on_ubuntu_and_debian_container

# ENV DEV_ADOPTED_ENV DEVELOPER_PC
ENV DEV_ADOPTED_ENV DEVELOPING_SERVER
ENV LANG ko_KR.UTF-8
ENV LC_ALL $LANG
ENV TZ Asia/Seoul
ENV EDITOR /usr/bin/vim


### 아파치 2.4 설치 #####################################
RUN apt-get install -y apache2-dev apache2-ssl-dev;
RUN apt-get install wget sudo -y
RUN apt-get clean all


#Port 오픈
EXPOSE 80
EXPOSE 443
EXPOSE 9900
EXPOSE 10000

#유저 생성 및 패스워드 추가 
RUN useradd -ms /bin/bash danawa
# RUN usermod -aG wheel danawa
RUN echo 'danawa:danawa' | chpasswd
RUN echo 'danawa ALL=NOPASSWD: ALL' >> /etc/sudoers
USER danawa

#Code-Server 다운로드
RUN mkdir -p /home/danawa/.cloud-ide
WORKDIR /home/danawa/.cloud-ide
RUN wget https://github.com/cdr/code-server/releases/download/3.4.1/code-server-3.4.1-linux-x86_64.tar.gz
RUN tar -xzvf code-server-3.4.1-linux-x86_64.tar.gz
RUN mv code-server-3.4.1-linux-x86_64 code-server

# GIT 환경변수 
ENV GIT_USERNAME "danawa"
ENV GIT_USERMAIL "danawa@danawa.com"
ENV GIT_REPO ""
ENV GIT_CREDENTIALS ""

#GIT 셋팅
RUN git config --global credential.helper store

# SSH settings
RUN sudo ssh-keygen -q -t dsa -f /etc/ssh/ssh_host_dsa_key -N "" 
RUN sudo ssh-keygen -q -t rsa -f /etc/ssh/ssh_host_rsa_key -N "" 
RUN sudo ssh-keygen -q -t ecdsa -f /etc/ssh/ssh_host_ecdsa_key -N "" 

RUN /bin/bash -c "mkdir -p /home/danawa/.ssh"
WORKDIR /home/danawa/.ssh
ENV RSA "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDFCcIM8Q/MtxSAvNWdQMAmH5MGoGV5BZGMvakneC+gVbvQzGF8vWHYJ/qYlZMi3kiIw1KVCrnuujzA+A/V0IPWwaepdq8hv/fDolRqNf6mubMjoWxbJuxgjCXnAs9AyiMkPuGRjKB3L2HOqGYV4cax3PgCLi9I0XHCQhgP0fla10h6Z31b67oR4pLEG24azdk3bGPIMkuBvAqODZk8ntG078nOLcaHJO21mp2k91+pRNob/O4/PIAulE+otvE+YfMfNqWqM6aHcayrueCR9U+5hkgoNTjCKm35PdxkXtmy4uzc5tw7t08f/Ur6Dg2ZkQLSp2lsa40+9FvB1u0JleRxTKPIf87Iwr65sWbZzULC1FMERmtmlT+CGroICGQDN2bkZztLPRBTo3v7GaTkLDUeVd4+zKAf9U44eGhWtsBL7ulgrcsWY1p2o21vqgheO7ovgIsm3JdBjJVgvSKAHCu+naipTClCKcRTEx6H1UuCJYKi1bCz0lmXcGVwZz1rAjs= admin@DA-PC-0484"
ENV FOLDER "project"

# Code-Server 패키지 설치 
RUN /bin/bash -c "/home/danawa/.cloud-ide/code-server/bin/code-server --install-extension felixfbecker.php-pack --force"
RUN /bin/bash -c "/home/danawa/.cloud-ide/code-server/bin/code-server --install-extension donjayamanne.git-extension-pack --force"
WORKDIR /home/danawa/.ssh

COPY /index.php /home/danawa/.template/

USER root
#Apache 설정
RUN rm -rf /etc/apache2/ports.conf 
RUN rm -rf /etc/apache2/sites-available/000-default.conf  
RUN echo 'Listen 8080' >>  /etc/apache2/ports.conf 
USER danawa
RUN sudo apt-get install openssh-server ssh -y

# 시작 
CMD /bin/bash -c "echo ${RSA} >> authorized_keys; \
                    sudo service ssh start ; \
                    sudo bash -c 'echo -e \"<Directory /home/danawa/${FOLDER}>\n\tOptions FollowSymLinks\n\tAllowOverride None\n\tRequire all granted\n</Directory>\" >> /etc/apache2/apache2.conf' ;\
                    sudo bash -c  'echo -e \"<VirtualHost *:8080>\n\tServerAdmin webmaster@localhost\n\tDocumentRoot /home/danawa/${FOLDER}\n</VirtualHost>\" >> /etc/apache2/sites-available/000-default.conf' ;\
                    service apache2 start ; \
                    git config --global user.name ${GIT_USERNAME}; \
                    git config --global user.email ${GIT_USERMAIL}; \
                    cd /home/danawa ; git clone ${GIT_REPO} ${FOLDER}; \
                    mv /home/danawa/.template /home/danawa/${FOLDER} ; rm -rf /home/danawa/${FOLDER}/.template ; cd /home/danawa/${FOLDER} ; git init ;\
		            cd ~ ; echo ${GIT_CREDENTIALS} >> .git-credentials ;  \
                    /home/danawa/.cloud-ide/code-server/bin/code-server --idle-timeout --log debug --extensions-dir /home/danawa/.local/share/code-server/extensions --auth=none --bind-addr 0.0.0.0:10000;"
