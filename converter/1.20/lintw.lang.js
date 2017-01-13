
// グローバルオブジェクトを取得する呪文
var global = new Function("return this")();

if (global.lintw == null) { global.lintw = {}; }

global.lintw.lang = ( function ()
{

// private

	// DBの仮想サイズ　word_chars.lengthの2倍よりも小さい値にする
	// 少しでも変えると変換規則がガラッと変わるのでなるべく変更しない
	var DB_MAX_SIZE = 128;

	// 単語生成に使われる文字群(72文字)
	var db = "あいうえおかがきぎくぐけげこごさざしじすずせぜそぞただちぢつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもやゆよらりるれろわをんぁ";
	
	// 語頭、語中、語尾
	// 0:NG | 1:OK
	var rule_db = 
	{
		"あ" : [1,1,1], "い" : [1,0,0], "う" : [1,0,0], "え" : [1,1,1], "お" : [1,1,1],
		"か" : [0,1,1], "が" : [0,1,1], "き" : [1,1,1], "ぎ" : [1,1,1], "く" : [1,1,1], "ぐ" : [0,1,1], "け" : [1,0,0], "げ" : [0,0,1], "こ" : [1,1,0], "ご" : [1,1,0],
		"さ" : [1,1,0], "ざ" : [0,1,1], "し" : [0,1,1], "じ" : [1,1,1], "す" : [1,1,1], "ず" : [0,1,0], "せ" : [1,1,1], "ぜ" : [1,1,0], "そ" : [1,1,1], "ぞ" : [0,0,1], 
		"た" : [1,1,1], "だ" : [1,1,1], "ち" : [0,1,1], "ぢ" : [0,1,1], "つ" : [1,1,1], "づ" : [0,1,1], "て" : [1,1,1], "で" : [1,1,1], "と" : [0,0,1], "ど" : [0,1,1],
		"な" : [1,1,0], "に" : [0,0,1], "ぬ" : [0,1,1], "ね" : [1,1,0], "の" : [0,0,1],
		"は" : [1,0,0], "ば" : [1,1,1], "ぱ" : [1,1,1], "ひ" : [1,1,0], "び" : [1,1,1], "ぴ" : [1,1,0], "ふ" : [1,1,1], "ぶ" : [1,1,0], "ぷ" : [0,0,1], "へ" : [1,0,0], "べ" : [1,1,1], "ぺ" : [0,1,1], "ほ" : [1,1,1], "ぼ" : [1,1,1], "ぽ" : [1,1,1], 
		"ま" : [1,1,1], "み" : [1,1,1], "む" : [0,1,1], "め" : [1,1,1], "も" : [1,1,1],
		"や" : [1,1,0], "ゆ" : [1,1,0], "よ" : [1,1,0], 
		"ら" : [1,1,1], "り" : [1,1,1], "る" : [0,1,1], "れ" : [1,1,0], "ろ" : [0,0,1],
		"わ" : [1,1,1], "を" : [1,1,1], "ん" : [1,1,1], 
		"ぁ" : [1,1,1], // lai rut ton fua vilon sto ad fja kai nish dron
	};
	
	var latin_db = 
	{
		"あ" : "al"  , "い" : "iŵ"  , "う" : "uŵ"  , "え" : "el"  , "お" : "o:"  ,
		"か" : "qua" , "が" : "gaŵ" , "き" : "ki:" , "ぎ" : "gil" , "く" : "kul" , "ぐ" : "gue" , "け" : "kel" , "げ" : "gen" , "こ" : "kon" , "ご" : "goŵ" ,
		"さ" : "san" , "ざ" : "za:" , "し" : "ŝio" , "じ" : "ĵos" , "す" : "sta" , "ず" : "zwao", "せ" : "sel" , "ぜ" : "zei" , "そ" : "so:" , "ぞ" : "zoi" , 
		"た" : "ta:" , "だ" : "da:" , "ち" : "ĉil" , "ぢ" : "diŵ" , "つ" : "cua" , "づ" : "dia" , "て" : "ten" , "で" : "den" , "と" : "tŵ"  , "ど" : "din" ,
		"な" : "na:" , "に" : "nia" , "ぬ" : "nus" , "ね" : "ne:" , "の" : "noa" ,
		"は" : "hal" , "ば" : "bal" , "ぱ" : "pan" , "ひ" : "hyea", "び" : "viŵ" , "ぴ" : "pi:" , "ふ" : "fiŵ" , "ぶ" : "vyu" , "ぷ" : "pia" , "へ" : "hel" , "べ" : "bel" , "ぺ" : "pen", "ほ" : "hoi" , "ぼ" : "boŵ" , "ぽ" : "pon" , 
		"ま" : "ma:" , "み" : "mieŵ", "む" : "mui" , "め" : "mel" , "も" : "mol" ,
		"や" : "jav" , "ゆ" : "jui" , "よ" : "jol" , 
		"ら" : "ran" , "り" : "lin" , "る" : "lua" , "れ" : "rei" , "ろ" : "log",
		"わ" : "waŵ" , "を" : "wol" , "ん" : "nes" ,
		"ぁ" : "coa" ,
		"0" : "mu:"  , "1" : "lil" , "2" : "nin" , "3" : "fei",
		"4" : "ĉetŵ" , "5" : "olc" , "6" : "kia" , "7" : "sra",
	};
	
	var lintw_char_song = "りらづされぐつげ"+
	                      "かどずにですこと"+
	                      "ためまもそべひぬ"+
	                      "せをはぢぱけてち"+
	                      "ねじのやみえぎざ"+
	                      "ぴおぶきゆんあぷ"+
	                      "がしびばふるぼぺ"+
	                      "よなくぞむだぜご"+
	                      "へぽほわうろいぁ";

	var lintw_dictionary =
	{
		"lintw" : "りと",
		"lintwian" : "りとぽ",
		"lintwese" : "りとすば",
		"theater" : "あかべ", "place" : "あかべ",
		"moon" : "り", "star" : "と",
		"morning" : "みべ", "afternoon" : "びざぁ", "evening" : "ひべど", "night" : "そせ",
		"human" : "ぽ", "people" : "ぽ",
		"language" : "すば",
		"up" : "さ", "top" : "さ",
		"bottom" : "ぴ", "down" : "ぴ",
		"left" : "い",
		"right" : "う",
		"go" : "ぶ", "move" : "ぶ",
		"die" : "ん", "death" : "ん",
		"happy" : "た",
		"i" : "ぜ",
		"you" : "ご",
		"'s" : "そ",
		"info" : "つた", "/info" : "ぶぱ",
		"ask" : "ほ", "/ask" : "んね",
		"q" : "ほ", "/q" : "んね",
		"question" : "ほ", "/question" : "んね",
		"wish" : "ねま", "/wish" : "をむ",
		"hope" : "ねま", "/hope" : "をむ",
	};

	var VAL_MAX = 9999943;
	var VAL_DIV = 5035651;
	
	// 値をループさせる
	// v : [min, max)
	function loop(v, min, max) {
	
		v -= min; var r = max - min; v = v % r; return v + min;
	}

	// 乱数的なハッシュ関数
	// 文字コードだけだとバリエーションがないのでインデックスも受け取る
	// c : str.charCodeAt(i);
	function hash(c, i)
	{
		i = Math.abs(i); i++; // iは正の整数
		var val = ((i + c * 187) * (i - c + 3443443));
		val = (Math.abs(i - c * 443) * (i * 223 + c)) % VAL_DIV;
		return val;
	}
	
	// 初期値を決める
	function init(str)
	{
		var val = 0;
		for(var i = 0; i < str.length; i++)
		{
			var c = str.charCodeAt(i);
			val = hash(c, val);
		}
		return val;
	}

	// head, body, tailの制約に反しない文字を返す
	// index : latin_dbでのインデックス(0 ～ DB_MAX_SIZE - 1)
	function getChar(index, head, body, tail)
	{
		while(true)
		{
			index = loop(index, 0, DB_MAX_SIZE);
			var lintwChar = db.charAt(index);
	
			// 未使用領域
			if (lintwChar === "")
			{
				index += DB_MAX_SIZE / 2;
				continue;
			}
				
			// 頭・胴・尾全てのルールにそぐわなかった場合
			if ( (head && rule_db[lintwChar][0] == 0) ||
			     (body && rule_db[lintwChar][1] == 0) ||
			     (tail && rule_db[lintwChar][2] == 0) ) // 1つでもtrueになったらやり直し
			{
				index++;
				continue;
			}
			else
			{
				return lintwChar;
			}
		}
	}

	function convertWord(seed) {
		seed = seed.toLowerCase();
		seed = seed.replace(/^\s+/g, "");
		seed = seed.replace(/\s+$/g, "");
		var ret = { seed : seed, lintwese : "", latin : "" };
		
		// 10進数 → Lintw8進数に変換する
		// 桁数が2の倍数になるように0で埋める
		if (seed.match( /^[0-9]+$/g )) {
		
			ret.lintwese = parseInt(seed, 10).toString(8);
			if (ret.lintwese.length % 2 != 0) { ret.lintwese = "0" + ret.lintwese; }
		}
		
		// 英字列( ' と / を含む) → Lintwese単語に変換する
		else if (seed.match( /^['/a-z]+$/g )) {
			
			// 辞書にあればそれを返す
			var dict = lintw_dictionary[seed];
			
			if (dict != null) {
			
				ret.lintwese = dict;
			}
			else {
			
				// 今seedのどこにいるのかフラグ
				// 語頭 | 語中 | 語尾
				var head = true;
				var body = false;
				var tail = (seed.length == 1);
				
				// seedに応じて初期値をバラつかせる
				// 0から始めるとパターン化する恐れがあるため
				var val = loop(init(seed), 0, VAL_DIV);
				
				// 戻り値：リントゥ語（ひらがな等の文字列）最低一文字
				ret.lintwese = getChar(val % DB_MAX_SIZE, head, body, tail);
				
				// seedを1文字ずつ走査していく
				for(var i = 0; i < seed.length; i++)
				{
					if (i == seed.length - 1)
					{
						body = false;
						tail = true;
					}
					else
					{
						body = true;
						tail = false; // 次にhashを割ったら0になる（切り捨てで）
					}
					
					val += hash(seed.charCodeAt(i), i);
					
					// 一文字追加する
					if (val >= VAL_MAX)
					{
						val = loop(val, 0, VAL_DIV);
						ret.lintwese += getChar(val % DB_MAX_SIZE, head, body, tail);
					}

					head = false;
				}
			}
		}
		else {
		
			return ret;
			// throw new Error("unknown seed type");
		}
		
		// 発音を求める
		for(var i = 0; i < ret.lintwese.length; i++) {
		
			ret.latin += latin_db[ret.lintwese.charAt(i)];
		}
			
		return ret;
	}
	
	function convertSentence(seedSentence) {
	
		var ret = [];
		var seeds = seedSentence.split( /\s*[- ]\s*/g ) || [];
		console.log(seeds);
		var splitChars = seedSentence.match( /\s*[- ]\s*/g ) || [];
		console.log(splitChars);
		splitChars.push(" ");

		for(var i = 0; i < seeds.length; i++) {
			var seed = seeds[i]; if (seed.length == 0) continue;
			var splitChar = splitChars[i].charAt(0);
			var word = convertWord(seed);
			ret.push(word);
			if (splitChar === "-") {
				ret.push( { seed : splitChar, lintwese : "", latin : "-" } );
			}
			else {
				ret.push( { seed : splitChar, lintwese : "・", latin : " " } );
			}
		}
		ret.pop();
		
		return ret;
	}
	
	function convertText(seedText) {
	
		var ret = [];
		var seedSentences = seedText.split( /\s*[!.]\s*/g ) || [];
		var splitChars = seedText.match( /[!.]/g ) || [];
		splitChars.push(".");
		
		if (seedSentences.length > 1) {
		}
		
		for(var i = 0; i < seedSentences.length; i++) {
			var seedSentence = seedSentences[i];
			if (seedSentence.length == 0) continue;
			var splitChar = splitChars[i].charAt(0);
			
			var words = convertSentence(seedSentence);
			
			if (splitChar === "!") {
				ret.push( { seed : "", lintwese : "！", latin : " " } );
			}
			else {
				ret.push( { seed : "", lintwese : "・", latin : " " } );
			}
			
			for(var j = 0; j < words.length; j++) {
				var word = words[j];
				ret.push(word);
			}
			if (splitChar === "!") {
				ret.push( { seed : "!", lintwese : "！", latin : "! " } );
			}
			else {
				ret.push( { seed : ".", lintwese : "・", latin : ". " } );
			}
		}
		/*
		ret.pop();
		if (seedSentences.length > 1) {
			ret.push( { seed : ".", lintwese : "・", latin : ". " } );
		}*/
		
		return ret;
	}
	
// public
	
	return {
		getWord : convertWord,
		getSentence : convertSentence,
		getText : convertText,
	};
	
})();
