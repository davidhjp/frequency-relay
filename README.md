# Frequency relay

A frequency relay is a device designed to accurately detect abnormal power frequency 
and react quickly by tripping or reconnecting loads in an attempt to maintain 
a stable network frequency. To detect changes in frequency, it uses a frequency analyzer that 
consists of three components: an average filter, a correlation calculator, and a peak detector. 
This repository contains the software implementation of the frequency analyzer, and a front-end visualizer
for plotting the outputs of each component.

To calculate a frequency, one needs to provide samples of sinusoid stored in a file where each line is a single 
sample value. A default the sampling rate is assumed to be 16 Khz.

To build the project, run `make` in the top-level directory. Running another `make` in the `server` directory will start
an http server listening on port 8080. Check for any error messages during the build for installing required tools.
