angular.module("omniControllers")
  .controller("WalletSendController",["$scope", "MIN_MINER_FEE", "MINER_SPEED", "OMNI_PROTOCOL_COST", "SATOSHI_UNIT", "Transaction", "$filter",
      function WalletSendController($scope, MIN_MINER_FEE, MINER_SPEED, PROTOCOL_FEE, SATOSHI_UNIT, Transaction, $filter){

        function checkSend() {
        	if($scope.selectedAddress != undefined){
	          avail = parseFloat($scope.selectedAddress.getDisplayBalance(0));
	          console.log(avail);

                  $scope.selectedAddress.estimateFee().then(function(result){
                    $scope.feeData=result;
                    if($scope.feeType != 'custom'){
                      $scope.minersFee = new Big(result.class_c[$scope.feeType]);
                    }
                  });

	          if ( $scope.selectedAsset.symbol == 'BTC' ) {
	            if ( avail >= parseFloat($scope.minersFee) ) {
	              $scope.cansend = true;
	            } else {
	              $scope.cansend = false;
	            }
	          } else {
	            if ( avail >= parseFloat($scope.minersFee) + parseFloat($scope.protocolFee) ) {
	              $scope.cansend = true;
	            } else {
	              $scope.cansend = false;
	            }
	          }
	          console.log($scope.cansend);
	        } else {
	            $scope.cansend = false;
	        }
        }

	$scope.minersFee = MIN_MINER_FEE;
	$scope.protocolFee = PROTOCOL_FEE;
        $scope.feeType = MINER_SPEED;

	$scope.selectedAsset = $scope.wallet.getAsset(1) || $scope.wallet.getAsset(0);
	$scope.selectedAddress = $scope.selectedAsset.tradableAddresses[0];

        checkSend();


      	$scope.showtesteco = $scope.account.getSetting('showtesteco');
      	$scope.userCurrency = $scope.account.getSetting("usercurrency");

      	$scope.setAsset = function(asset){
      		$scope.selectedAsset = asset;
      		$scope.selectedAddress = $scope.selectedAsset.tradableAddresses[0];
                checkSend();
      	}
      	
      	$scope.setAddress = function(address){
      		$scope.selectedAddress = address;
                checkSend();
      	}

      	$scope.editTransactionCost = function(){
      		$scope.modalManager.openTransactionCostModal($scope, $scope.sendTransaction);
                checkSend();
      	}

      	$scope.sendTransaction = function(){
			// TODO: Validations
			var fee = $scope.minersFee;
			var amount = $scope.sendByValue ? $scope.sendAmount * $scope.selectedAsset.price : $scope.sendAmount;
			var simpleSend = new Transaction(0,$scope.selectedAddress,fee,{
			        transaction_version:0,
				currency_identifier:$scope.selectedAsset.id,
			        amount_to_transfer : +new Big(amount).valueOf(),
			        transaction_to: $scope.sendTo,
			        donate: $scope.account.getSetting("donate"),
				marker: $scope.marker || false
			});
		    
			var btcPrice = $scope.selectedAsset.price;
                        if ($scope.selectedAsset.symbol == 'BTC') {
				var displayFee = fee;
			} else {
				var displayFee = new Big(fee).plus(new Big(PROTOCOL_FEE)).valueOf();
			}
			
			var modalScope = {
				title:"WALLET.SEND.CONFIRM",
				token:$filter('truncate')($scope.selectedAsset.name,15,0),
				sendAmount:$scope.sendAmount,
				symbol:$scope.selectedAsset.symbol,
				sendValue:$scope.sendAmount * btcPrice,
				toAddress:$scope.sendTo,
				fees:displayFee,
				confirmText:"WALLET.SEND.FUNDS",
				successRedirect:"/wallet"
			};


			$scope.modalManager.openConfirmationModal({
				dataTemplate: '/views/modals/partials/send.html',
				footerTemplate: $scope.selectedAsset.id == 0 ? '/views/modals/partials/send_footer.html' : undefined,
				scope: $scope.selectedAsset.id != 0 ? modalScope : angular.extend(modalScope, {
					btcValueChanged:false,
					bitcoinValue:btcPrice,
					bitcoin:$scope.selectedAsset
				}),
				transaction:simpleSend
			})
		};

	}])
