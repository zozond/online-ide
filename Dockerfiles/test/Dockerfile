FROM centos:7.6.1810

#유저 생성 및 패스워드 추가 
RUN useradd -ms /bin/bash danawa
RUN usermod -aG wheel danawa
RUN yum install -y sudo 
RUN echo 'danawa' | passwd danawa --stdin
USER danawa

CMD "/bin/bash"