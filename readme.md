# 二维码扫码APP

此APP基于ionic5构建，使用cordova-plugin-qrscanner插件进行开发

## 扫描除二维码之外的条形码

官方二维码插件不支持一维码或者条形码，因此需要对源码进行修改，
Android：找到/plugin/cordova-plugin-qrscanner/src/android/QRScanner.java查找formatList.add(BarcodeFormat.QR_CODE)，再后面添加如下代码
总的可以解码的条形码格式如下：
AZTEC, CODABAR, CODE_39, CODE_93, CODE_128, DATA_MATRIX, EAN_8, EAN_13, ITF, MAXICODE, PDF_417, QR_CODE, RSS_14, RSS_EXPANDED, UPC_A, UPC_E, UPC_EAN_EXTENSION

```java
    formatList.add(BarcodeFormat.QR_CODE); // 二维码
    formatList.add(BarcodeFormat.UPC_A);   // 通用产品代码
    formatList.add(BarcodeFormat.UPC_E);   // 通用产品代码
    formatList.add(BarcodeFormat.EAN_13);  // 商品码
    formatList.add(BarcodeFormat.EAN_8);   // 商品码
    formatList.add(BarcodeFormat.CODE_39); // 条形码
    formatList.add(BarcodeFormat.CODE_93); // 条形码
    formatList.add(BarcodeFormat.CODE_128);//条形码
    formatList.add(BarcodeFormat.ITF);     // 外箱条码
    formatList.add(BarcodeFormat.DATA_MATRIX); // 小零件的标识
    formatList.add(BarcodeFormat.AZTEC); // 二维码
    formatList.add(BarcodeFormat.CODABA);
    formatList.add(BarcodeFormat.MAXICODE);
    formatList.add(BarcodeFormat.PDF_417); // 堆叠式二维条码
    formatList.add(BarcodeFormat.RSS_14);
    formatList.add(BarcodeFormat.RSS_EXPANDED);
    formatList.add(BarcodeFormat.UPC_EAN_EXTENSION);

    // 找到大概504行 查询 if(barcodeResult.getText() != null) {，修改如下
    if(barcodeResult.getText() != null) {
        scanning = false;
        // 将数据存入map
        HashMap result = new HashMap();
        String text = barcodeResult.getText();
        BarcodeFormat format = barcodeResult.getBarcodeFormat();
        // 判断条码
        String formatName = "";
        if(format == BarcodeFormat.UPC_A || format == BarcodeFormat.UPC_E) {
            formatName = "UPC";
        }else if(format == BarcodeFormat.EAN_13 || format == BarcodeFormat.EAN_8) {
            formatName = "EAN";
        }else if(format == BarcodeFormat.CODE_39 || format == BarcodeFormat.CODE_93 || format == BarcodeFormat.CODE_128) {
            formatName = "CODE";
        }else if(format == BarcodeFormat.ITF){
            formatName = "ITF";
        }else if(format == BarcodeFormat.DATA_MATRIX){
            formatName = "DATA_MATRIX";
        }else if(format == BarcodeFormat.AZTEC) {
            formatName = "AZTEC";
        }else if(format == BarcodeFormat.MAXICODE) {
            formatName = "MAXICODE";
        }else if(format == BarcodeFormat.PDF_417) {
            formatName = "PDF_417";
        }else if(format == BarcodeFormat.RSS_14){
            formatName = "RSS_14";
        }else if(format == BarcodeFormat.RSS_EXPANDED) {
            formatName = "RSS_EXPANDED";
        }else if(format == BarcodeFormat.UPC_EAN_EXTENSION) {
            formatName = "UPC_EAN_EXTENSION";
        }else {
            formatName = "QRCODE";
        }
        result.put("text", text);
        result.put("format", formatName);
        JSONObject obj = new JSONObject(result);
        this.nextScanCallback.success(obj);
        this.nextScanCallback = null;
    }
    // 返回的结果为{text: 'text', format: 'QRCODE'}
```

IOS：plugins/cordova-plugin-qrscanner/src/ios/QRScanner.swift大概156行处，找到metaOutput!.metadataObjectTypes = [AVMetadataObject.ObjectType.qr]修改为

```swift
metaOutput!.metadataObjectTypes = [AVMetadataObject.ObjectType.qr, AVMetadataObject.ObjectType.code39, AVMetadataObject.ObjectType.code93, AVMetadataObject.ObjectType.code128, AVMetadataObject.ObjectType.dataMatrix,AVMetadataObject.ObjectType.ean8, AVMetadataObject.ObjectType.ean13]
```

在找到大概241行if found.type == AVMetadataObject.ObjectType.qr && found.stringValue != nil {，修改为

```swift
if (found.type == AVMetadataObject.ObjectType.qr || found.type == AVMetadataObject.ObjectType.code39 || found.type == AVMetadataObject.ObjectType.code93 || found.type == AVMetadataObject.ObjectType.code128 || found.type == AVMetadataObject.ObjectType.dataMatrix || found.type == AVMetadataObject.ObjectType.ean8 || found.type == AVMetadataObject.ObjectType.ean13) && found.stringValue != nil {
```

添加完成后，需要移除之前的cordova-android，然后再重新安装，命令如下：

Android平台

```shell
ionic cordova platform rm android;ionic cordova platform add android;
```

ios平台

```shell
ionic cordova platform rm ios;ionic cordova platform add ios;
```

## 注意事项

使用cordova-plugin-telerik-imagepicker插件时，必须在config.xml的<edit-config>中添加

```xml
<application android:requestLegacyExternalStorage="true" />
```

若需要对cordova-plugin-telerik-imagepicker插件进行汉语支持的话，还得进行增加对应的翻译文本，打开plugins/cordova-plugin-telerik-imagepicker/src/android/Library/res/
新建一个名为values-zh的目录，并新建一个名为multiimagechooser_strings_zh.xml的文件，输入如下代码

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="multi_app_name">图像选择器</string>
    <string name="free_version_label">免费版本 - 剩余图片: %d张</string>
    <string name="error_database">打开相册出错</string>
    <string name="requesting_thumbnails">加载中，请稍等...</string>
    <string name="multi_image_picker_processing_images_title">图片处理中</string>
    <string name="multi_image_picker_processing_images_message">这可能需要几分钟时间</string>
    <string name="discard" translatable="false">取消</string>
    <string name="done" translatable="false">确定</string>
 </resources>
```

如果不起作用，请直接将values-zh目录复制到/platform/android/app/src/res目录下即可

## 从图片读取二维码的另一种代码形式

先在index.html中导入upngJS(<https://www.npmjs.com/package/upng-js>)

采用如下代码：

```typescript
    declare var UPNG: any;
    //将图片转换为base64
    async imageToBase64(ImagePath) {
        console.log('path', ImagePath);

        const copyPath = ImagePath;
        const splitPath = copyPath.split('/');
        const imageName = splitPath[splitPath.length - 1];
        const filePath = ImagePath.split(imageName)[0];
        console.log(filePath, imageName);
        const base64 = await this.file.readAsDataURL(filePath, imageName);

        this.base64Image = base64;
        // console.log('base64', this.base64Image);
        // 将二维码转换为文本
        const blob = this.convertBase64ToBlob(this.base64Image);
        const qrcodeText = await this.blob2text(blob);
        const deQRcode = qrcodeText;
        console.log('decode', deQRcode);
    }

    convertBase64ToBlob(base64Image: string) {
        // Split into two parts
        const parts = base64Image.split(';base64,');
        // Hold the content type
        const imageType = parts[0].split(':')[1];
        console.log('type', imageType);

        // Decode Base64 string
        const decodedData = window.atob(parts[1]);
        // Create UNIT8ARRAY of size same as row data length
        const uInt8Array = new Uint8Array(decodedData.length);
        // Insert all character code into uInt8Array
        for (let i = 0; i < decodedData.length; ++i) {
            uInt8Array[i] = decodedData.charCodeAt(i);
        }
        // Return BLOB image after conversion
        return new Blob([uInt8Array], { type: imageType });
    }

    async blob2text(blob) {
        const myReader = new FileReader();
        myReader.readAsArrayBuffer(blob);
        myReader.onloadend = e => {
            const buffer = e.target.result; // arraybuffer object
            const img = UPNG.decode(buffer); // put ArrayBuffer of the PNG file into UPNG.decode
            const rgba = UPNG.toRGBA8(img)[0]; // UPNG.toRGBA8 returns array of frames, size: width * height * 4 bytes.
            const code = jsQR(new Uint8ClampedArray(rgba), img.width, img.height);
            if (code) {
                return code.data;
            } else {
                console.log('decode failed', code);
            }
        };
    }
```

## 签名release打包

生成证书

```shell
    # 证书生成
    keytool -genkey -v -keystore release-key.keystore -alias tony -keyalg RSA -keysize 2048 -validity 10000
```

打release生产包

```shell
    # 打包命令
    ionic cordova build android --prod --release
    # keytool -importkeystore -srckeystore release-key.keystore -destkeystore release-key.keystore -deststoretype pkcs12
    jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore release-key.keystore ./platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk aliasName
    # Zipalign优化
    cd C:/Users/xxxxx/AppData/Local/Android/Sdk/build-tools/29.0.3
    ./zipalign.exe -v 4 G:/ionic/qrcode-tab/platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk ./tqrcode.apk
    cp ./tqrcode.apk G:/ionic/qrcode-tab
    rm -r ./tqrcode.apk
    cd G:/ionic/qrcode-tab
    adb install ./tqrcode.apk
```

## 语言翻译文件对应表

zh-CN 简体中文  
zh-TW 繁体台湾  
zh-HK 繁体香港  
en    英文  
af    荷兰语  
ar    阿拉伯语  
be    白俄罗斯  
cs    捷克  
da    丹麦  
fr    法语  
de    德国  
it    意大利  
ja    日语  
ko    韩语  
ru    俄罗斯  
es    西班牙  
sv    瑞典  
th    泰国  
uk    乌克兰  
vi    越南
