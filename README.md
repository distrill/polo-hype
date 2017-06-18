## polo-hype  
A set of helpers for pumping (and dumping) hype coins on [polo](https://poloniex.com/).  

#### Utility functions
Usage: `node lib/tools ${fn}`, where fn is one of:  
`pump ${ticker}`: transfer all BTC funds into `ticker`  
`dump ${ticker}`: transfer all `ticker` funds into BTC  
`watch ${ticker}`: continually fetch and print the (BTC) price of `ticker`  

#### What makes us want to pump some hype shit?
We are looking for EMA to be above SMA, with little variance in the distance between the two. 