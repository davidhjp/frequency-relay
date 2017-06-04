BINDIR=bin
SYSJR=sysjr
SYSJC=sysjc
URL=https://github.com/hjparker/systemj-release/raw/master/com/systemjtechnology/systemj/v2.1-135/systemj-v2.1-135.tgz
SYSJR=systemj/bin/sysjr
SYSJC=systemj/bin/sysjc

all: systemj/bin bin/Freq.class 

bin/Freq.class: src/relay.sysj
	$(SYSJC) -d $(BINDIR) --silence $?

systemj/bin:
	wget $(URL) -P systemj
	cd systemj; tar xvaf systemj*.tgz ; mv sjdk*/* . ; chmod u+x bin/*

run:
	CLASSPATH=$(BINDIR) JAVA_OPTS="-Dsymsize=160 -Davesize=5" $(SYSJR) lcf/relay.xml

clean:
	rm -rf $(BINDIR)
	rm -rf systemj

