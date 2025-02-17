import { z } from "zod";

const emojiRequestSchema = z.string();

// --- api-endpoints.ts ---
const idRequestSchema = z.union([z.string(), z.string()]);

export const personUserObjectResponseSchema = z.object({
  type: z.literal("person"),
  person: z.object({
    email: z.string().optional(),
  }),
  name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  id: idRequestSchema,
  object: z.literal("user"),
});

const emptyObjectSchema = z.record(z.never());

export const partialUserObjectResponseSchema = z.object({
  id: idRequestSchema,
  object: z.literal("user"),
});

export const botUserObjectResponseSchema = z.object({
  type: z.literal("bot"),
  bot: z.union([
    emptyObjectSchema,
    z.object({
      owner: z.union([
        z.object({
          type: z.literal("user"),
          user: z.union([
            z.object({
              type: z.literal("person"),
              person: z.object({
                email: z.string(),
              }),
              name: z.string().nullable(),
              avatar_url: z.string().nullable(),
              id: idRequestSchema,
              object: z.literal("user"),
            }),
            partialUserObjectResponseSchema,
          ]),
        }),
        z.object({
          type: z.literal("workspace"),
          workspace: z.literal(true),
        }),
      ]),
      workspace_name: z.string().nullable(),
    }),
  ]),
  name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  id: idRequestSchema,
  object: z.literal("user"),
});

export const userObjectResponseSchema = z.union([
  personUserObjectResponseSchema,
  botUserObjectResponseSchema,
]);

const selectColorSchema = z.union([
  z.literal("default"),
  z.literal("gray"),
  z.literal("brown"),
  z.literal("orange"),
  z.literal("yellow"),
  z.literal("green"),
  z.literal("blue"),
  z.literal("purple"),
  z.literal("pink"),
  z.literal("red"),
]);

const partialSelectResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: selectColorSchema,
});

const timeZoneRequestSchema = z.union([
  z.literal("Africa/Abidjan"),
  z.literal("Africa/Accra"),
  z.literal("Africa/Addis_Ababa"),
  z.literal("Africa/Algiers"),
  z.literal("Africa/Asmara"),
  z.literal("Africa/Asmera"),
  z.literal("Africa/Bamako"),
  z.literal("Africa/Bangui"),
  z.literal("Africa/Banjul"),
  z.literal("Africa/Bissau"),
  z.literal("Africa/Blantyre"),
  z.literal("Africa/Brazzaville"),
  z.literal("Africa/Bujumbura"),
  z.literal("Africa/Cairo"),
  z.literal("Africa/Casablanca"),
  z.literal("Africa/Ceuta"),
  z.literal("Africa/Conakry"),
  z.literal("Africa/Dakar"),
  z.literal("Africa/Dar_es_Salaam"),
  z.literal("Africa/Djibouti"),
  z.literal("Africa/Douala"),
  z.literal("Africa/El_Aaiun"),
  z.literal("Africa/Freetown"),
  z.literal("Africa/Gaborone"),
  z.literal("Africa/Harare"),
  z.literal("Africa/Johannesburg"),
  z.literal("Africa/Juba"),
  z.literal("Africa/Kampala"),
  z.literal("Africa/Khartoum"),
  z.literal("Africa/Kigali"),
  z.literal("Africa/Kinshasa"),
  z.literal("Africa/Lagos"),
  z.literal("Africa/Libreville"),
  z.literal("Africa/Lome"),
  z.literal("Africa/Luanda"),
  z.literal("Africa/Lubumbashi"),
  z.literal("Africa/Lusaka"),
  z.literal("Africa/Malabo"),
  z.literal("Africa/Maputo"),
  z.literal("Africa/Maseru"),
  z.literal("Africa/Mbabane"),
  z.literal("Africa/Mogadishu"),
  z.literal("Africa/Monrovia"),
  z.literal("Africa/Nairobi"),
  z.literal("Africa/Ndjamena"),
  z.literal("Africa/Niamey"),
  z.literal("Africa/Nouakchott"),
  z.literal("Africa/Ouagadougou"),
  z.literal("Africa/Porto-Novo"),
  z.literal("Africa/Sao_Tome"),
  z.literal("Africa/Timbuktu"),
  z.literal("Africa/Tripoli"),
  z.literal("Africa/Tunis"),
  z.literal("Africa/Windhoek"),
  z.literal("America/Adak"),
  z.literal("America/Anchorage"),
  z.literal("America/Anguilla"),
  z.literal("America/Antigua"),
  z.literal("America/Araguaina"),
  z.literal("America/Argentina/Buenos_Aires"),
  z.literal("America/Argentina/Catamarca"),
  z.literal("America/Argentina/ComodRivadavia"),
  z.literal("America/Argentina/Cordoba"),
  z.literal("America/Argentina/Jujuy"),
  z.literal("America/Argentina/La_Rioja"),
  z.literal("America/Argentina/Mendoza"),
  z.literal("America/Argentina/Rio_Gallegos"),
  z.literal("America/Argentina/Salta"),
  z.literal("America/Argentina/San_Juan"),
  z.literal("America/Argentina/San_Luis"),
  z.literal("America/Argentina/Tucuman"),
  z.literal("America/Argentina/Ushuaia"),
  z.literal("America/Aruba"),
  z.literal("America/Asuncion"),
  z.literal("America/Atikokan"),
  z.literal("America/Atka"),
  z.literal("America/Bahia"),
  z.literal("America/Bahia_Banderas"),
  z.literal("America/Barbados"),
  z.literal("America/Belem"),
  z.literal("America/Belize"),
  z.literal("America/Blanc-Sablon"),
  z.literal("America/Boa_Vista"),
  z.literal("America/Bogota"),
  z.literal("America/Boise"),
  z.literal("America/Buenos_Aires"),
  z.literal("America/Cambridge_Bay"),
  z.literal("America/Campo_Grande"),
  z.literal("America/Cancun"),
  z.literal("America/Caracas"),
  z.literal("America/Catamarca"),
  z.literal("America/Cayenne"),
  z.literal("America/Cayman"),
  z.literal("America/Chicago"),
  z.literal("America/Chihuahua"),
  z.literal("America/Ciudad_Juarez"),
  z.literal("America/Coral_Harbour"),
  z.literal("America/Cordoba"),
  z.literal("America/Costa_Rica"),
  z.literal("America/Creston"),
  z.literal("America/Cuiaba"),
  z.literal("America/Curacao"),
  z.literal("America/Danmarkshavn"),
  z.literal("America/Dawson"),
  z.literal("America/Dawson_Creek"),
  z.literal("America/Denver"),
  z.literal("America/Detroit"),
  z.literal("America/Dominica"),
  z.literal("America/Edmonton"),
  z.literal("America/Eirunepe"),
  z.literal("America/El_Salvador"),
  z.literal("America/Ensenada"),
  z.literal("America/Fort_Nelson"),
  z.literal("America/Fort_Wayne"),
  z.literal("America/Fortaleza"),
  z.literal("America/Glace_Bay"),
  z.literal("America/Godthab"),
  z.literal("America/Goose_Bay"),
  z.literal("America/Grand_Turk"),
  z.literal("America/Grenada"),
  z.literal("America/Guadeloupe"),
  z.literal("America/Guatemala"),
  z.literal("America/Guayaquil"),
  z.literal("America/Guyana"),
  z.literal("America/Halifax"),
  z.literal("America/Havana"),
  z.literal("America/Hermosillo"),
  z.literal("America/Indiana/Indianapolis"),
  z.literal("America/Indiana/Knox"),
  z.literal("America/Indiana/Marengo"),
  z.literal("America/Indiana/Petersburg"),
  z.literal("America/Indiana/Tell_City"),
  z.literal("America/Indiana/Vevay"),
  z.literal("America/Indiana/Vincennes"),
  z.literal("America/Indiana/Winamac"),
  z.literal("America/Indianapolis"),
  z.literal("America/Inuvik"),
  z.literal("America/Iqaluit"),
  z.literal("America/Jamaica"),
  z.literal("America/Jujuy"),
  z.literal("America/Juneau"),
  z.literal("America/Kentucky/Louisville"),
  z.literal("America/Kentucky/Monticello"),
  z.literal("America/Knox_IN"),
  z.literal("America/Kralendijk"),
  z.literal("America/La_Paz"),
  z.literal("America/Lima"),
  z.literal("America/Los_Angeles"),
  z.literal("America/Louisville"),
  z.literal("America/Lower_Princes"),
  z.literal("America/Maceio"),
  z.literal("America/Managua"),
  z.literal("America/Manaus"),
  z.literal("America/Marigot"),
  z.literal("America/Martinique"),
  z.literal("America/Matamoros"),
  z.literal("America/Mazatlan"),
  z.literal("America/Mendoza"),
  z.literal("America/Menominee"),
  z.literal("America/Merida"),
  z.literal("America/Metlakatla"),
  z.literal("America/Mexico_City"),
  z.literal("America/Miquelon"),
  z.literal("America/Moncton"),
  z.literal("America/Monterrey"),
  z.literal("America/Montevideo"),
  z.literal("America/Montreal"),
  z.literal("America/Montserrat"),
  z.literal("America/Nassau"),
  z.literal("America/New_York"),
  z.literal("America/Nipigon"),
  z.literal("America/Nome"),
  z.literal("America/Noronha"),
  z.literal("America/North_Dakota/Beulah"),
  z.literal("America/North_Dakota/Center"),
  z.literal("America/North_Dakota/New_Salem"),
  z.literal("America/Nuuk"),
  z.literal("America/Ojinaga"),
  z.literal("America/Panama"),
  z.literal("America/Pangnirtung"),
  z.literal("America/Paramaribo"),
  z.literal("America/Phoenix"),
  z.literal("America/Port-au-Prince"),
  z.literal("America/Port_of_Spain"),
  z.literal("America/Porto_Acre"),
  z.literal("America/Porto_Velho"),
  z.literal("America/Puerto_Rico"),
  z.literal("America/Punta_Arenas"),
  z.literal("America/Rainy_River"),
  z.literal("America/Rankin_Inlet"),
  z.literal("America/Recife"),
  z.literal("America/Regina"),
  z.literal("America/Resolute"),
  z.literal("America/Rio_Branco"),
  z.literal("America/Rosario"),
  z.literal("America/Santa_Isabel"),
  z.literal("America/Santarem"),
  z.literal("America/Santiago"),
  z.literal("America/Santo_Domingo"),
  z.literal("America/Sao_Paulo"),
  z.literal("America/Scoresbysund"),
  z.literal("America/Shiprock"),
  z.literal("America/Sitka"),
  z.literal("America/St_Barthelemy"),
  z.literal("America/St_Johns"),
  z.literal("America/St_Kitts"),
  z.literal("America/St_Lucia"),
  z.literal("America/St_Thomas"),
  z.literal("America/St_Vincent"),
  z.literal("America/Swift_Current"),
  z.literal("America/Tegucigalpa"),
  z.literal("America/Thule"),
  z.literal("America/Thunder_Bay"),
  z.literal("America/Tijuana"),
  z.literal("America/Toronto"),
  z.literal("America/Tortola"),
  z.literal("America/Vancouver"),
  z.literal("America/Virgin"),
  z.literal("America/Whitehorse"),
  z.literal("America/Winnipeg"),
  z.literal("America/Yakutat"),
  z.literal("America/Yellowknife"),
  z.literal("Antarctica/Casey"),
  z.literal("Antarctica/Davis"),
  z.literal("Antarctica/DumontDUrville"),
  z.literal("Antarctica/Macquarie"),
  z.literal("Antarctica/Mawson"),
  z.literal("Antarctica/McMurdo"),
  z.literal("Antarctica/Palmer"),
  z.literal("Antarctica/Rothera"),
  z.literal("Antarctica/South_Pole"),
  z.literal("Antarctica/Syowa"),
  z.literal("Antarctica/Troll"),
  z.literal("Antarctica/Vostok"),
  z.literal("Arctic/Longyearbyen"),
  z.literal("Asia/Aden"),
  z.literal("Asia/Almaty"),
  z.literal("Asia/Amman"),
  z.literal("Asia/Anadyr"),
  z.literal("Asia/Aqtau"),
  z.literal("Asia/Aqtobe"),
  z.literal("Asia/Ashgabat"),
  z.literal("Asia/Ashkhabad"),
  z.literal("Asia/Atyrau"),
  z.literal("Asia/Baghdad"),
  z.literal("Asia/Bahrain"),
  z.literal("Asia/Baku"),
  z.literal("Asia/Bangkok"),
  z.literal("Asia/Barnaul"),
  z.literal("Asia/Beirut"),
  z.literal("Asia/Bishkek"),
  z.literal("Asia/Brunei"),
  z.literal("Asia/Calcutta"),
  z.literal("Asia/Chita"),
  z.literal("Asia/Choibalsan"),
  z.literal("Asia/Chongqing"),
  z.literal("Asia/Chungking"),
  z.literal("Asia/Colombo"),
  z.literal("Asia/Dacca"),
  z.literal("Asia/Damascus"),
  z.literal("Asia/Dhaka"),
  z.literal("Asia/Dili"),
  z.literal("Asia/Dubai"),
  z.literal("Asia/Dushanbe"),
  z.literal("Asia/Famagusta"),
  z.literal("Asia/Gaza"),
  z.literal("Asia/Harbin"),
  z.literal("Asia/Hebron"),
  z.literal("Asia/Ho_Chi_Minh"),
  z.literal("Asia/Hong_Kong"),
  z.literal("Asia/Hovd"),
  z.literal("Asia/Irkutsk"),
  z.literal("Asia/Istanbul"),
  z.literal("Asia/Jakarta"),
  z.literal("Asia/Jayapura"),
  z.literal("Asia/Jerusalem"),
  z.literal("Asia/Kabul"),
  z.literal("Asia/Kamchatka"),
  z.literal("Asia/Karachi"),
  z.literal("Asia/Kashgar"),
  z.literal("Asia/Kathmandu"),
  z.literal("Asia/Katmandu"),
  z.literal("Asia/Khandyga"),
  z.literal("Asia/Kolkata"),
  z.literal("Asia/Krasnoyarsk"),
  z.literal("Asia/Kuala_Lumpur"),
  z.literal("Asia/Kuching"),
  z.literal("Asia/Kuwait"),
  z.literal("Asia/Macao"),
  z.literal("Asia/Macau"),
  z.literal("Asia/Magadan"),
  z.literal("Asia/Makassar"),
  z.literal("Asia/Manila"),
  z.literal("Asia/Muscat"),
  z.literal("Asia/Nicosia"),
  z.literal("Asia/Novokuznetsk"),
  z.literal("Asia/Novosibirsk"),
  z.literal("Asia/Omsk"),
  z.literal("Asia/Oral"),
  z.literal("Asia/Phnom_Penh"),
  z.literal("Asia/Pontianak"),
  z.literal("Asia/Pyongyang"),
  z.literal("Asia/Qatar"),
  z.literal("Asia/Qostanay"),
  z.literal("Asia/Qyzylorda"),
  z.literal("Asia/Rangoon"),
  z.literal("Asia/Riyadh"),
  z.literal("Asia/Saigon"),
  z.literal("Asia/Sakhalin"),
  z.literal("Asia/Samarkand"),
  z.literal("Asia/Seoul"),
  z.literal("Asia/Shanghai"),
  z.literal("Asia/Singapore"),
  z.literal("Asia/Srednekolymsk"),
  z.literal("Asia/Taipei"),
  z.literal("Asia/Tashkent"),
  z.literal("Asia/Tbilisi"),
  z.literal("Asia/Tehran"),
  z.literal("Asia/Tel_Aviv"),
  z.literal("Asia/Thimbu"),
  z.literal("Asia/Thimphu"),
  z.literal("Asia/Tokyo"),
  z.literal("Asia/Tomsk"),
  z.literal("Asia/Ujung_Pandang"),
  z.literal("Asia/Ulaanbaatar"),
  z.literal("Asia/Ulan_Bator"),
  z.literal("Asia/Urumqi"),
  z.literal("Asia/Ust-Nera"),
  z.literal("Asia/Vientiane"),
  z.literal("Asia/Vladivostok"),
  z.literal("Asia/Yakutsk"),
  z.literal("Asia/Yangon"),
  z.literal("Asia/Yekaterinburg"),
  z.literal("Asia/Yerevan"),
  z.literal("Atlantic/Azores"),
  z.literal("Atlantic/Bermuda"),
  z.literal("Atlantic/Canary"),
  z.literal("Atlantic/Cape_Verde"),
  z.literal("Atlantic/Faeroe"),
  z.literal("Atlantic/Faroe"),
  z.literal("Atlantic/Jan_Mayen"),
  z.literal("Atlantic/Madeira"),
  z.literal("Atlantic/Reykjavik"),
  z.literal("Atlantic/South_Georgia"),
  z.literal("Atlantic/St_Helena"),
  z.literal("Atlantic/Stanley"),
  z.literal("Australia/ACT"),
  z.literal("Australia/Adelaide"),
  z.literal("Australia/Brisbane"),
  z.literal("Australia/Broken_Hill"),
  z.literal("Australia/Canberra"),
  z.literal("Australia/Currie"),
  z.literal("Australia/Darwin"),
  z.literal("Australia/Eucla"),
  z.literal("Australia/Hobart"),
  z.literal("Australia/LHI"),
  z.literal("Australia/Lindeman"),
  z.literal("Australia/Lord_Howe"),
  z.literal("Australia/Melbourne"),
  z.literal("Australia/NSW"),
  z.literal("Australia/North"),
  z.literal("Australia/Perth"),
  z.literal("Australia/Queensland"),
  z.literal("Australia/South"),
  z.literal("Australia/Sydney"),
  z.literal("Australia/Tasmania"),
  z.literal("Australia/Victoria"),
  z.literal("Australia/West"),
  z.literal("Australia/Yancowinna"),
  z.literal("Brazil/Acre"),
  z.literal("Brazil/DeNoronha"),
  z.literal("Brazil/East"),
  z.literal("Brazil/West"),
  z.literal("CET"),
  z.literal("CST6CDT"),
  z.literal("Canada/Atlantic"),
  z.literal("Canada/Central"),
  z.literal("Canada/Eastern"),
  z.literal("Canada/Mountain"),
  z.literal("Canada/Newfoundland"),
  z.literal("Canada/Pacific"),
  z.literal("Canada/Saskatchewan"),
  z.literal("Canada/Yukon"),
  z.literal("Chile/Continental"),
  z.literal("Chile/EasterIsland"),
  z.literal("Cuba"),
  z.literal("EET"),
  z.literal("EST"),
  z.literal("EST5EDT"),
  z.literal("Egypt"),
  z.literal("Eire"),
  z.literal("Etc/GMT"),
  z.literal("Etc/GMT+0"),
  z.literal("Etc/GMT+1"),
  z.literal("Etc/GMT+10"),
  z.literal("Etc/GMT+11"),
  z.literal("Etc/GMT+12"),
  z.literal("Etc/GMT+2"),
  z.literal("Etc/GMT+3"),
  z.literal("Etc/GMT+4"),
  z.literal("Etc/GMT+5"),
  z.literal("Etc/GMT+6"),
  z.literal("Etc/GMT+7"),
  z.literal("Etc/GMT+8"),
  z.literal("Etc/GMT+9"),
  z.literal("Etc/GMT-0"),
  z.literal("Etc/GMT-1"),
  z.literal("Etc/GMT-10"),
  z.literal("Etc/GMT-11"),
  z.literal("Etc/GMT-12"),
  z.literal("Etc/GMT-13"),
  z.literal("Etc/GMT-14"),
  z.literal("Etc/GMT-2"),
  z.literal("Etc/GMT-3"),
  z.literal("Etc/GMT-4"),
  z.literal("Etc/GMT-5"),
  z.literal("Etc/GMT-6"),
  z.literal("Etc/GMT-7"),
  z.literal("Etc/GMT-8"),
  z.literal("Etc/GMT-9"),
  z.literal("Etc/GMT0"),
  z.literal("Etc/Greenwich"),
  z.literal("Etc/UCT"),
  z.literal("Etc/UTC"),
  z.literal("Etc/Universal"),
  z.literal("Etc/Zulu"),
  z.literal("Europe/Amsterdam"),
  z.literal("Europe/Andorra"),
  z.literal("Europe/Astrakhan"),
  z.literal("Europe/Athens"),
  z.literal("Europe/Belfast"),
  z.literal("Europe/Belgrade"),
  z.literal("Europe/Berlin"),
  z.literal("Europe/Bratislava"),
  z.literal("Europe/Brussels"),
  z.literal("Europe/Bucharest"),
  z.literal("Europe/Budapest"),
  z.literal("Europe/Busingen"),
  z.literal("Europe/Chisinau"),
  z.literal("Europe/Copenhagen"),
  z.literal("Europe/Dublin"),
  z.literal("Europe/Gibraltar"),
  z.literal("Europe/Guernsey"),
  z.literal("Europe/Helsinki"),
  z.literal("Europe/Isle_of_Man"),
  z.literal("Europe/Istanbul"),
  z.literal("Europe/Jersey"),
  z.literal("Europe/Kaliningrad"),
  z.literal("Europe/Kiev"),
  z.literal("Europe/Kirov"),
  z.literal("Europe/Kyiv"),
  z.literal("Europe/Lisbon"),
  z.literal("Europe/Ljubljana"),
  z.literal("Europe/London"),
  z.literal("Europe/Luxembourg"),
  z.literal("Europe/Madrid"),
  z.literal("Europe/Malta"),
  z.literal("Europe/Mariehamn"),
  z.literal("Europe/Minsk"),
  z.literal("Europe/Monaco"),
  z.literal("Europe/Moscow"),
  z.literal("Europe/Nicosia"),
  z.literal("Europe/Oslo"),
  z.literal("Europe/Paris"),
  z.literal("Europe/Podgorica"),
  z.literal("Europe/Prague"),
  z.literal("Europe/Riga"),
  z.literal("Europe/Rome"),
  z.literal("Europe/Samara"),
  z.literal("Europe/San_Marino"),
  z.literal("Europe/Sarajevo"),
  z.literal("Europe/Saratov"),
  z.literal("Europe/Simferopol"),
  z.literal("Europe/Skopje"),
  z.literal("Europe/Sofia"),
  z.literal("Europe/Stockholm"),
  z.literal("Europe/Tallinn"),
  z.literal("Europe/Tirane"),
  z.literal("Europe/Tiraspol"),
  z.literal("Europe/Ulyanovsk"),
  z.literal("Europe/Uzhgorod"),
  z.literal("Europe/Vaduz"),
  z.literal("Europe/Vatican"),
  z.literal("Europe/Vienna"),
  z.literal("Europe/Vilnius"),
  z.literal("Europe/Volgograd"),
  z.literal("Europe/Warsaw"),
  z.literal("Europe/Zagreb"),
  z.literal("Europe/Zaporozhye"),
  z.literal("Europe/Zurich"),
  z.literal("GB"),
  z.literal("GB-Eire"),
  z.literal("GMT"),
  z.literal("GMT+0"),
  z.literal("GMT-0"),
  z.literal("GMT0"),
  z.literal("Greenwich"),
  z.literal("HST"),
  z.literal("Hongkong"),
  z.literal("Iceland"),
  z.literal("Indian/Antananarivo"),
  z.literal("Indian/Chagos"),
  z.literal("Indian/Christmas"),
  z.literal("Indian/Cocos"),
  z.literal("Indian/Comoro"),
  z.literal("Indian/Kerguelen"),
  z.literal("Indian/Mahe"),
  z.literal("Indian/Maldives"),
  z.literal("Indian/Mauritius"),
  z.literal("Indian/Mayotte"),
  z.literal("Indian/Reunion"),
  z.literal("Iran"),
  z.literal("Israel"),
  z.literal("Jamaica"),
  z.literal("Japan"),
  z.literal("Kwajalein"),
  z.literal("Libya"),
  z.literal("MET"),
  z.literal("MST"),
  z.literal("MST7MDT"),
  z.literal("Mexico/BajaNorte"),
  z.literal("Mexico/BajaSur"),
  z.literal("Mexico/General"),
  z.literal("NZ"),
  z.literal("NZ-CHAT"),
  z.literal("Navajo"),
  z.literal("PRC"),
  z.literal("PST8PDT"),
  z.literal("Pacific/Apia"),
  z.literal("Pacific/Auckland"),
  z.literal("Pacific/Bougainville"),
  z.literal("Pacific/Chatham"),
  z.literal("Pacific/Chuuk"),
  z.literal("Pacific/Easter"),
  z.literal("Pacific/Efate"),
  z.literal("Pacific/Enderbury"),
  z.literal("Pacific/Fakaofo"),
  z.literal("Pacific/Fiji"),
  z.literal("Pacific/Funafuti"),
  z.literal("Pacific/Galapagos"),
  z.literal("Pacific/Gambier"),
  z.literal("Pacific/Guadalcanal"),
  z.literal("Pacific/Guam"),
  z.literal("Pacific/Honolulu"),
  z.literal("Pacific/Johnston"),
  z.literal("Pacific/Kanton"),
  z.literal("Pacific/Kiritimati"),
  z.literal("Pacific/Kosrae"),
  z.literal("Pacific/Kwajalein"),
  z.literal("Pacific/Majuro"),
  z.literal("Pacific/Marquesas"),
  z.literal("Pacific/Midway"),
  z.literal("Pacific/Nauru"),
  z.literal("Pacific/Niue"),
  z.literal("Pacific/Norfolk"),
  z.literal("Pacific/Noumea"),
  z.literal("Pacific/Pago_Pago"),
  z.literal("Pacific/Palau"),
  z.literal("Pacific/Pitcairn"),
  z.literal("Pacific/Pohnpei"),
  z.literal("Pacific/Ponape"),
  z.literal("Pacific/Port_Moresby"),
  z.literal("Pacific/Rarotonga"),
  z.literal("Pacific/Saipan"),
  z.literal("Pacific/Samoa"),
  z.literal("Pacific/Tahiti"),
  z.literal("Pacific/Tarawa"),
  z.literal("Pacific/Tongatapu"),
  z.literal("Pacific/Truk"),
  z.literal("Pacific/Wake"),
  z.literal("Pacific/Wallis"),
  z.literal("Pacific/Yap"),
  z.literal("Poland"),
  z.literal("Portugal"),
  z.literal("ROC"),
  z.literal("ROK"),
  z.literal("Singapore"),
  z.literal("Turkey"),
  z.literal("UCT"),
  z.literal("US/Alaska"),
  z.literal("US/Aleutian"),
  z.literal("US/Arizona"),
  z.literal("US/Central"),
  z.literal("US/East-Indiana"),
  z.literal("US/Eastern"),
  z.literal("US/Hawaii"),
  z.literal("US/Indiana-Starke"),
  z.literal("US/Michigan"),
  z.literal("US/Mountain"),
  z.literal("US/Pacific"),
  z.literal("US/Pacific-New"),
  z.literal("US/Samoa"),
  z.literal("UTC"),
  z.literal("Universal"),
  z.literal("W-SU"),
  z.literal("WET"),
  z.literal("Zulu"),
]);

const dateResponseSchema = z.object({
  start: z.string(),
  end: z.string().nullable(),
  time_zone: timeZoneRequestSchema.nullable(),
});

const stringRequestSchema = z.string();

const textRequestSchema = z.string();

const stringFormulaPropertyResponseSchema = z.object({
  type: z.literal("string"),
  string: z.string().nullable(),
});

const dateFormulaPropertyResponseSchema = z.object({
  type: z.literal("date"),
  date: dateResponseSchema.nullable(),
});

const numberFormulaPropertyResponseSchema = z.object({
  type: z.literal("number"),
  number: z.number().nullable(),
});

const booleanFormulaPropertyResponseSchema = z.object({
  type: z.literal("boolean"),
  boolean: z.boolean().nullable(),
});

const formulaPropertyResponseSchema = z.union([
  stringFormulaPropertyResponseSchema,
  dateFormulaPropertyResponseSchema,
  numberFormulaPropertyResponseSchema,
  booleanFormulaPropertyResponseSchema,
]);

const verificationPropertyUnverifiedResponseSchema = z.object({
  state: z.literal("unverified"),
  date: z.null(),
  verified_by: z.null(),
});

const verificationPropertyResponseSchema = z.object({
  state: z.union([z.literal("verified"), z.literal("expired")]),
  date: dateResponseSchema.nullable(),
  verified_by: z
    .union([
      z.object({
        id: idRequestSchema,
      }),
      z.object({
        person: z.object({
          email: z.string().optional(),
        }),
        id: idRequestSchema,
        type: z.literal("person").optional(),
        name: z.string().optional().nullable(),
        avatar_url: z.string().optional().nullable(),
        object: z.literal("user").optional(),
      }),
      z.object({
        bot: z.union([
          emptyObjectSchema,
          z.object({
            owner: z.union([
              z.object({
                type: z.literal("user"),
                user: z.union([
                  z.object({
                    type: z.literal("person"),
                    person: z.object({
                      email: z.string(),
                    }),
                    name: z.string().nullable(),
                    avatar_url: z.string().nullable(),
                    id: idRequestSchema,
                    object: z.literal("user"),
                  }),
                  partialUserObjectResponseSchema,
                ]),
              }),
              z.object({
                type: z.literal("workspace"),
                workspace: z.literal(true),
              }),
            ]),
            workspace_name: z.string().nullable(),
          }),
        ]),
        id: idRequestSchema,
        type: z.literal("bot").optional(),
        name: z.string().optional().nullable(),
        avatar_url: z.string().optional().nullable(),
        object: z.literal("user").optional(),
      }),
    ])
    .nullable(),
});

const annotationResponseSchema = z.object({
  bold: z.boolean(),
  italic: z.boolean(),
  strikethrough: z.boolean(),
  underline: z.boolean(),
  code: z.boolean(),
  color: z.union([
    z.literal("default"),
    z.literal("gray"),
    z.literal("brown"),
    z.literal("orange"),
    z.literal("yellow"),
    z.literal("green"),
    z.literal("blue"),
    z.literal("purple"),
    z.literal("pink"),
    z.literal("red"),
    z.literal("gray_background"),
    z.literal("brown_background"),
    z.literal("orange_background"),
    z.literal("yellow_background"),
    z.literal("green_background"),
    z.literal("blue_background"),
    z.literal("purple_background"),
    z.literal("pink_background"),
    z.literal("red_background"),
  ]),
});

export const textRichTextItemResponseSchema = z.object({
  type: z.literal("text"),
  text: z.object({
    content: z.string(),
    link: z
      .object({
        url: textRequestSchema,
      })
      .nullable(),
  }),
  annotations: annotationResponseSchema,
  plain_text: z.string(),
  href: z.string().nullable(),
});

const linkPreviewMentionResponseSchema = z.object({
  url: textRequestSchema,
});

const templateMentionDateTemplateMentionResponseSchema = z.object({
  type: z.literal("template_mention_date"),
  template_mention_date: z.union([z.literal("today"), z.literal("now")]),
});

const templateMentionUserTemplateMentionResponseSchema = z.object({
  type: z.literal("template_mention_user"),
  template_mention_user: z.literal("me"),
});

const templateMentionResponseSchema = z.union([
  templateMentionDateTemplateMentionResponseSchema,
  templateMentionUserTemplateMentionResponseSchema,
]);

export const mentionRichTextItemResponseSchema = z.object({
  type: z.literal("mention"),
  mention: z.union([
    z.object({
      type: z.literal("user"),
      user: z.union([
        partialUserObjectResponseSchema,
        userObjectResponseSchema,
      ]),
    }),
    z.object({
      type: z.literal("date"),
      date: dateResponseSchema,
    }),
    z.object({
      type: z.literal("link_preview"),
      link_preview: linkPreviewMentionResponseSchema,
    }),
    z.object({
      type: z.literal("template_mention"),
      template_mention: templateMentionResponseSchema,
    }),
    z.object({
      type: z.literal("page"),
      page: z.object({
        id: idRequestSchema,
      }),
    }),
    z.object({
      type: z.literal("database"),
      database: z.object({
        id: idRequestSchema,
      }),
    }),
  ]),
  annotations: annotationResponseSchema,
  plain_text: z.string(),
  href: z.string().nullable(),
});

export const equationRichTextItemResponseSchema = z.object({
  type: z.literal("equation"),
  equation: z.object({
    expression: textRequestSchema,
  }),
  annotations: annotationResponseSchema,
  plain_text: z.string(),
  href: z.string().nullable(),
});

export const richTextItemResponseSchema = z.union([
  textRichTextItemResponseSchema,
  mentionRichTextItemResponseSchema,
  equationRichTextItemResponseSchema,
]);

const rollupFunctionSchema = z.union([
  z.literal("count"),
  z.literal("count_values"),
  z.literal("empty"),
  z.literal("not_empty"),
  z.literal("unique"),
  z.literal("show_unique"),
  z.literal("percent_empty"),
  z.literal("percent_not_empty"),
  z.literal("sum"),
  z.literal("average"),
  z.literal("median"),
  z.literal("min"),
  z.literal("max"),
  z.literal("range"),
  z.literal("earliest_date"),
  z.literal("latest_date"),
  z.literal("date_range"),
  z.literal("checked"),
  z.literal("unchecked"),
  z.literal("percent_checked"),
  z.literal("percent_unchecked"),
  z.literal("count_per_group"),
  z.literal("percent_per_group"),
  z.literal("show_original"),
]);

// BlockObjectResponse
const apiColorSchema = z.union([
  z.literal("default"),
  z.literal("gray"),
  z.literal("brown"),
  z.literal("orange"),
  z.literal("yellow"),
  z.literal("green"),
  z.literal("blue"),
  z.literal("purple"),
  z.literal("pink"),
  z.literal("red"),
  z.literal("gray_background"),
  z.literal("brown_background"),
  z.literal("orange_background"),
  z.literal("yellow_background"),
  z.literal("green_background"),
  z.literal("blue_background"),
  z.literal("purple_background"),
  z.literal("pink_background"),
  z.literal("red_background"),
]);

export const paragraphBlockObjectResponseSchema = z.object({
  type: z.literal("paragraph"),
  paragraph: z.object({
    rich_text: z.array(richTextItemResponseSchema),
    color: apiColorSchema,
  }),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const heading1BlockObjectResponseSchema = z.object({
  type: z.literal("heading_1"),
  heading_1: z.object({
    rich_text: z.array(richTextItemResponseSchema),
    color: apiColorSchema,
    is_toggleable: z.boolean(),
  }),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const heading2BlockObjectResponseSchema = z.object({
  type: z.literal("heading_2"),
  heading_2: z.object({
    rich_text: z.array(richTextItemResponseSchema),
    color: apiColorSchema,
    is_toggleable: z.boolean(),
  }),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const heading3BlockObjectResponseSchema = z.object({
  type: z.literal("heading_3"),
  heading_3: z.object({
    rich_text: z.array(richTextItemResponseSchema),
    color: apiColorSchema,
    is_toggleable: z.boolean(),
  }),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const bulletedListItemBlockObjectResponseSchema = z.object({
  type: z.literal("bulleted_list_item"),
  bulleted_list_item: z.object({
    rich_text: z.array(richTextItemResponseSchema),
    color: apiColorSchema,
  }),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const numberedListItemBlockObjectResponseSchema = z.object({
  type: z.literal("numbered_list_item"),
  numbered_list_item: z.object({
    rich_text: z.array(richTextItemResponseSchema),
    color: apiColorSchema,
  }),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const quoteBlockObjectResponseSchema = z.object({
  type: z.literal("quote"),
  quote: z.object({
    rich_text: z.array(richTextItemResponseSchema),
    color: apiColorSchema,
  }),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const toDoBlockObjectResponseSchema = z.object({
  type: z.literal("to_do"),
  to_do: z.object({
    rich_text: z.array(richTextItemResponseSchema),
    color: apiColorSchema,
    checked: z.boolean(),
  }),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const toggleBlockObjectResponseSchema = z.object({
  type: z.literal("toggle"),
  toggle: z.object({
    rich_text: z.array(richTextItemResponseSchema),
    color: apiColorSchema,
  }),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const templateBlockObjectResponseSchema = z.object({
  type: z.literal("template"),
  template: z.object({
    rich_text: z.array(richTextItemResponseSchema),
  }),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const syncedBlockBlockObjectResponseSchema = z.object({
  type: z.literal("synced_block"),
  synced_block: z.object({
    synced_from: z
      .object({
        type: z.literal("block_id"),
        block_id: idRequestSchema,
      })
      .nullable(),
  }),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const childPageBlockObjectResponseSchema = z.object({
  type: z.literal("child_page"),
  child_page: z.object({
    title: z.string(),
  }),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const childDatabaseBlockObjectResponseSchema = z.object({
  type: z.literal("child_database"),
  child_database: z.object({
    title: z.string(),
  }),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const equationBlockObjectResponseSchema = z.object({
  type: z.literal("equation"),
  equation: z.object({
    expression: z.string(),
  }),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

const languageRequestSchema = z.union([
  z.literal("abap"),
  z.literal("agda"),
  z.literal("arduino"),
  z.literal("assembly"),
  z.literal("bash"),
  z.literal("basic"),
  z.literal("bnf"),
  z.literal("c"),
  z.literal("c#"),
  z.literal("c++"),
  z.literal("clojure"),
  z.literal("coffeescript"),
  z.literal("coq"),
  z.literal("css"),
  z.literal("dart"),
  z.literal("dhall"),
  z.literal("diff"),
  z.literal("docker"),
  z.literal("ebnf"),
  z.literal("elixir"),
  z.literal("elm"),
  z.literal("erlang"),
  z.literal("f#"),
  z.literal("flow"),
  z.literal("fortran"),
  z.literal("gherkin"),
  z.literal("glsl"),
  z.literal("go"),
  z.literal("graphql"),
  z.literal("groovy"),
  z.literal("haskell"),
  z.literal("html"),
  z.literal("idris"),
  z.literal("java"),
  z.literal("javascript"),
  z.literal("json"),
  z.literal("julia"),
  z.literal("kotlin"),
  z.literal("latex"),
  z.literal("less"),
  z.literal("lisp"),
  z.literal("livescript"),
  z.literal("llvm ir"),
  z.literal("lua"),
  z.literal("makefile"),
  z.literal("markdown"),
  z.literal("markup"),
  z.literal("matlab"),
  z.literal("mathematica"),
  z.literal("mermaid"),
  z.literal("nix"),
  z.literal("notion formula"),
  z.literal("objective-c"),
  z.literal("ocaml"),
  z.literal("pascal"),
  z.literal("perl"),
  z.literal("php"),
  z.literal("plain text"),
  z.literal("powershell"),
  z.literal("prolog"),
  z.literal("protobuf"),
  z.literal("purescript"),
  z.literal("python"),
  z.literal("r"),
  z.literal("racket"),
  z.literal("reason"),
  z.literal("ruby"),
  z.literal("rust"),
  z.literal("sass"),
  z.literal("scala"),
  z.literal("scheme"),
  z.literal("scss"),
  z.literal("shell"),
  z.literal("solidity"),
  z.literal("sql"),
  z.literal("swift"),
  z.literal("toml"),
  z.literal("typescript"),
  z.literal("vb.net"),
  z.literal("verilog"),
  z.literal("vhdl"),
  z.literal("visual basic"),
  z.literal("webassembly"),
  z.literal("xml"),
  z.literal("yaml"),
  z.literal("java/c/c++/c#"),
]);

export const codeBlockObjectResponseSchema = z.object({
  type: z.literal("code"),
  code: z.object({
    rich_text: z.array(richTextItemResponseSchema),
    caption: z.array(richTextItemResponseSchema),
    language: languageRequestSchema,
  }),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const calloutBlockObjectResponseSchema = z.object({
  type: z.literal("callout"),
  callout: z.object({
    rich_text: z.array(richTextItemResponseSchema),
    color: apiColorSchema,
    icon: z
      .union([
        z.object({
          type: z.literal("emoji"),
          emoji: emojiRequestSchema,
        }),
        z.object({
          type: z.literal("external"),
          external: z.object({
            url: textRequestSchema,
          }),
        }),
        z.object({
          type: z.literal("file"),
          file: z.object({
            url: z.string(),
            expiry_time: z.string(),
          }),
        }),
      ])
      .nullable(),
  }),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const dividerBlockObjectResponseSchema = z.object({
  type: z.literal("divider"),
  divider: emptyObjectSchema,
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const breadcrumbBlockObjectResponseSchema = z.object({
  type: z.literal("breadcrumb"),
  breadcrumb: emptyObjectSchema,
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const tableOfContentsBlockObjectResponseSchema = z.object({
  type: z.literal("table_of_contents"),
  table_of_contents: z.object({
    color: apiColorSchema,
  }),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const columnListBlockObjectResponseSchema = z.object({
  type: z.literal("column_list"),
  column_list: emptyObjectSchema,
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const columnBlockObjectResponseSchema = z.object({
  type: z.literal("column"),
  column: emptyObjectSchema,
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const linkToPageBlockObjectResponseSchema = z.object({
  type: z.literal("link_to_page"),
  link_to_page: z.union([
    z.object({
      type: z.literal("page_id"),
      page_id: idRequestSchema,
    }),
    z.object({
      type: z.literal("database_id"),
      database_id: idRequestSchema,
    }),
    z.object({
      type: z.literal("comment_id"),
      comment_id: idRequestSchema,
    }),
  ]),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const tableBlockObjectResponseSchema = z.object({
  type: z.literal("table"),
  table: z.object({
    has_column_header: z.boolean(),
    has_row_header: z.boolean(),
    table_width: z.number(),
  }),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const tableRowBlockObjectResponseSchema = z.object({
  type: z.literal("table_row"),
  table_row: z.object({
    cells: z.array(z.array(richTextItemResponseSchema)),
  }),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const embedBlockObjectResponseSchema = z.object({
  type: z.literal("embed"),
  embed: z.object({
    url: z.string(),
    caption: z.array(richTextItemResponseSchema),
  }),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const bookmarkBlockObjectResponseSchema = z.object({
  type: z.literal("bookmark"),
  bookmark: z.object({
    url: z.string(),
    caption: z.array(richTextItemResponseSchema),
  }),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const imageBlockObjectResponseSchema = z.object({
  type: z.literal("image"),
  image: z.union([
    z.object({
      type: z.literal("external"),
      external: z.object({
        url: textRequestSchema,
      }),
      caption: z.array(richTextItemResponseSchema),
    }),
    z.object({
      type: z.literal("file"),
      file: z.object({
        url: z.string(),
        expiry_time: z.string(),
      }),
      caption: z.array(richTextItemResponseSchema),
    }),
  ]),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const videoBlockObjectResponseSchema = z.object({
  type: z.literal("video"),
  video: z.union([
    z.object({
      type: z.literal("external"),
      external: z.object({
        url: textRequestSchema,
      }),
      caption: z.array(richTextItemResponseSchema),
    }),
    z.object({
      type: z.literal("file"),
      file: z.object({
        url: z.string(),
        expiry_time: z.string(),
      }),
      caption: z.array(richTextItemResponseSchema),
    }),
  ]),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const pdfBlockObjectResponseSchema = z.object({
  type: z.literal("pdf"),
  pdf: z.union([
    z.object({
      type: z.literal("external"),
      external: z.object({
        url: textRequestSchema,
      }),
      caption: z.array(richTextItemResponseSchema),
    }),
    z.object({
      type: z.literal("file"),
      file: z.object({
        url: z.string(),
        expiry_time: z.string(),
      }),
      caption: z.array(richTextItemResponseSchema),
    }),
  ]),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const fileBlockObjectResponseSchema = z.object({
  type: z.literal("file"),
  file: z.union([
    z.object({
      type: z.literal("external"),
      external: z.object({
        url: textRequestSchema,
      }),
      caption: z.array(richTextItemResponseSchema),
      name: z.string(),
    }),
    z.object({
      type: z.literal("file"),
      file: z.object({
        url: z.string(),
        expiry_time: z.string(),
      }),
      caption: z.array(richTextItemResponseSchema),
      name: z.string(),
    }),
  ]),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const audioBlockObjectResponseSchema = z.object({
  type: z.literal("audio"),
  audio: z.union([
    z.object({
      type: z.literal("external"),
      external: z.object({
        url: textRequestSchema,
      }),
      caption: z.array(richTextItemResponseSchema),
    }),
    z.object({
      type: z.literal("file"),
      file: z.object({
        url: z.string(),
        expiry_time: z.string(),
      }),
      caption: z.array(richTextItemResponseSchema),
    }),
  ]),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const linkPreviewBlockObjectResponseSchema = z.object({
  type: z.literal("link_preview"),
  link_preview: z.object({
    url: textRequestSchema,
  }),
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const unsupportedBlockObjectResponseSchema = z.object({
  type: z.literal("unsupported"),
  unsupported: emptyObjectSchema,
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  object: z.literal("block"),
  id: z.string(),
  created_time: z.string(),
  created_by: partialUserObjectResponseSchema,
  last_edited_time: z.string(),
  last_edited_by: partialUserObjectResponseSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

export const blockObjectResponseSchema = z.union([
  paragraphBlockObjectResponseSchema,
  heading1BlockObjectResponseSchema,
  heading2BlockObjectResponseSchema,
  heading3BlockObjectResponseSchema,
  bulletedListItemBlockObjectResponseSchema,
  numberedListItemBlockObjectResponseSchema,
  quoteBlockObjectResponseSchema,
  toDoBlockObjectResponseSchema,
  toggleBlockObjectResponseSchema,
  templateBlockObjectResponseSchema,
  syncedBlockBlockObjectResponseSchema,
  childPageBlockObjectResponseSchema,
  childDatabaseBlockObjectResponseSchema,
  equationBlockObjectResponseSchema,
  codeBlockObjectResponseSchema,
  calloutBlockObjectResponseSchema,
  dividerBlockObjectResponseSchema,
  breadcrumbBlockObjectResponseSchema,
  tableOfContentsBlockObjectResponseSchema,
  columnListBlockObjectResponseSchema,
  columnBlockObjectResponseSchema,
  linkToPageBlockObjectResponseSchema,
  tableBlockObjectResponseSchema,
  tableRowBlockObjectResponseSchema,
  embedBlockObjectResponseSchema,
  bookmarkBlockObjectResponseSchema,
  imageBlockObjectResponseSchema,
  videoBlockObjectResponseSchema,
  pdfBlockObjectResponseSchema,
  fileBlockObjectResponseSchema,
  audioBlockObjectResponseSchema,
  linkPreviewBlockObjectResponseSchema,
  unsupportedBlockObjectResponseSchema,
]);
// --- api-endpoints.ts ---

export const numberPropertyPageObjectResponseSchema = z.object({
  type: z.literal("number"),
  number: z.number().nullable(),
  id: z.string(),
});

export const urlPropertyPageObjectResponseSchema = z.object({
  type: z.literal("url"),
  url: z.string().nullable(),
  id: z.string(),
});

export const selectPropertyPageObjectResponseSchema = z.object({
  type: z.literal("select"),
  select: partialSelectResponseSchema.nullable(),
  id: z.string(),
});

export const multiSelectPropertyPageObjectResponseSchema = z.object({
  type: z.literal("multi_select"),
  multi_select: z.array(partialSelectResponseSchema),
  id: z.string(),
});

export const statusPropertyPageObjectResponseSchema = z.object({
  type: z.literal("status"),
  status: partialSelectResponseSchema.nullable(),
  id: z.string(),
});

export const datePropertyPageObjectResponseSchema = z.object({
  type: z.literal("date"),
  date: dateResponseSchema.nullable(),
  id: z.string(),
});

export const emailPropertyPageObjectResponseSchema = z.object({
  type: z.literal("email"),
  email: z.string().nullable(),
  id: z.string(),
});

export const phoneNumberPropertyPageObjectResponseSchema = z.object({
  type: z.literal("phone_number"),
  phone_number: z.string().nullable(),
  id: z.string(),
});

export const checkboxPropertyPageObjectResponseSchema = z.object({
  type: z.literal("checkbox"),
  checkbox: z.boolean(),
  id: z.string(),
});

export const filesPropertyPageObjectResponseSchema = z.object({
  type: z.literal("files"),
  files: z.array(
    z.union([
      z.object({
        file: z.object({
          url: z.string(),
          expiry_time: z.string(),
        }),
        name: stringRequestSchema,
        type: z.literal("file").optional(),
      }),
      z.object({
        external: z.object({
          url: textRequestSchema,
        }),
        name: stringRequestSchema,
        type: z.literal("external").optional(),
      }),
    ]),
  ),
  id: z.string(),
});

export const createdByPropertyPageObjectResponseSchema = z.object({
  type: z.literal("created_by"),
  created_by: z.union([
    partialUserObjectResponseSchema,
    userObjectResponseSchema,
  ]),
  id: z.string(),
});

export const createdTimePropertyPageObjectResponseSchema = z.object({
  type: z.literal("created_time"),
  created_time: z.string(),
  id: z.string(),
});

export const lastEditedByPropertyPageObjectResponseSchema = z.object({
  type: z.literal("last_edited_by"),
  last_edited_by: z.union([
    partialUserObjectResponseSchema,
    userObjectResponseSchema,
  ]),
  id: z.string(),
});

export const lastEditedTimePropertyPageObjectResponseSchema = z.object({
  type: z.literal("last_edited_time"),
  last_edited_time: z.string(),
  id: z.string(),
});

export const formulaPropertyPageObjectResponseSchema = z.object({
  type: z.literal("formula"),
  formula: formulaPropertyResponseSchema,
  id: z.string(),
});

export const buttonPropertyPageObjectResponseSchema = z.object({
  type: z.literal("button"),
  button: z.record(z.never()),
  id: z.string(),
});

export const uniqueIdPropertyPageObjectResponseSchema = z.object({
  type: z.literal("unique_id"),
  unique_id: z.object({
    prefix: z.string().nullable(),
    number: z.number().nullable(),
  }),
  id: z.string(),
});

export const verificationPropertyPageObjectResponseSchema = z.object({
  type: z.literal("verification"),
  verification: z
    .union([
      verificationPropertyUnverifiedResponseSchema,
      verificationPropertyResponseSchema,
    ])
    .nullable(),
  id: z.string(),
});

export const titlePropertyPageObjectResponseSchema = z.object({
  type: z.literal("title"),
  title: z.array(textRichTextItemResponseSchema),
  id: z.string(),
});

export const richTextPropertyPageObjectResponseSchema = z.object({
  type: z.literal("rich_text"),
  rich_text: z.array(textRichTextItemResponseSchema),
  id: z.string(),
});

export const peoplePropertyPageObjectResponseSchema = z.object({
  type: z.literal("people"),
  people: z.array(
    z.union([partialUserObjectResponseSchema, userObjectResponseSchema]),
  ),
  id: z.string(),
});

export const relationPropertyPageObjectResponseSchema = z.object({
  type: z.literal("relation"),
  relation: z.array(
    z.object({
      id: z.string(),
    }),
  ),
  id: z.string(),
});

export const rollupPropertyPageObjectResponseSchema = z.object({
  type: z.literal("rollup"),
  rollup: z.union([
    z.object({
      type: z.literal("number"),
      number: z.number().nullable(),
      function: rollupFunctionSchema,
    }),
    z.object({
      type: z.literal("date"),
      date: dateResponseSchema.nullable(),
      function: rollupFunctionSchema,
    }),
    z.object({
      type: z.literal("array"),
      array: z.array(
        z.union([
          z.object({
            type: z.literal("number"),
            number: z.number().nullable(),
          }),
          z.object({
            type: z.literal("url"),
            url: z.string().nullable(),
          }),
          z.object({
            type: z.literal("select"),
            select: partialSelectResponseSchema.nullable(),
          }),
          z.object({
            type: z.literal("multi_select"),
            multi_select: z.array(partialSelectResponseSchema),
          }),
          z.object({
            type: z.literal("status"),
            status: partialSelectResponseSchema.nullable(),
          }),
          z.object({
            type: z.literal("date"),
            date: dateResponseSchema.nullable(),
          }),
          z.object({
            type: z.literal("email"),
            email: z.string().nullable(),
          }),
          z.object({
            type: z.literal("phone_number"),
            phone_number: z.string().nullable(),
          }),
          z.object({
            type: z.literal("checkbox"),
            checkbox: z.boolean(),
          }),
          z.object({
            type: z.literal("files"),
            files: z.array(
              z.union([
                z.object({
                  file: z.object({
                    url: z.string(),
                    expiry_time: z.string(),
                  }),
                  name: stringRequestSchema,
                  type: z.literal("file").optional(),
                }),
                z.object({
                  external: z.object({
                    url: textRequestSchema,
                  }),
                  name: stringRequestSchema,
                  type: z.literal("external").optional(),
                }),
              ]),
            ),
          }),
          z.object({
            type: z.literal("created_by"),
            created_by: z.union([
              partialUserObjectResponseSchema,
              userObjectResponseSchema,
            ]),
          }),
          z.object({
            type: z.literal("created_time"),
            created_time: z.string(),
          }),
          z.object({
            type: z.literal("last_edited_by"),
            last_edited_by: z.union([
              partialUserObjectResponseSchema,
              userObjectResponseSchema,
            ]),
          }),
          z.object({
            type: z.literal("last_edited_time"),
            last_edited_time: z.string(),
          }),
          z.object({
            type: z.literal("formula"),
            formula: formulaPropertyResponseSchema,
          }),
          z.object({
            type: z.literal("button"),
            button: z.record(z.never()),
          }),
          z.object({
            type: z.literal("unique_id"),
            unique_id: z.object({
              prefix: z.string().nullable(),
              number: z.number().nullable(),
            }),
          }),
          z.object({
            type: z.literal("verification"),
            verification: z
              .union([
                verificationPropertyUnverifiedResponseSchema,
                verificationPropertyResponseSchema,
              ])
              .nullable(),
          }),
          z.object({
            type: z.literal("title"),
            title: z.array(richTextItemResponseSchema),
          }),
          z.object({
            type: z.literal("rich_text"),
            rich_text: z.array(richTextItemResponseSchema),
          }),
          z.object({
            type: z.literal("people"),
            people: z.array(
              z.union([
                partialUserObjectResponseSchema,
                userObjectResponseSchema,
              ]),
            ),
          }),
          z.object({
            type: z.literal("relation"),
            relation: z.array(
              z.object({
                id: z.string(),
              }),
            ),
          }),
        ]),
      ),
      function: rollupFunctionSchema,
    }),
  ]),
  id: z.string(),
});

export const pageObjectResponseSchema = z.object({
  parent: z.union([
    z.object({
      type: z.literal("database_id"),
      database_id: z.string(),
    }),
    z.object({
      type: z.literal("page_id"),
      page_id: z.string(),
    }),
    z.object({
      type: z.literal("block_id"),
      block_id: z.string(),
    }),
    z.object({
      type: z.literal("workspace"),
      workspace: z.literal(true),
    }),
  ]),
  properties: z.record(
    z.union([
      numberPropertyPageObjectResponseSchema,
      urlPropertyPageObjectResponseSchema,
      selectPropertyPageObjectResponseSchema,
      multiSelectPropertyPageObjectResponseSchema,
      statusPropertyPageObjectResponseSchema,
      datePropertyPageObjectResponseSchema,
      emailPropertyPageObjectResponseSchema,
      phoneNumberPropertyPageObjectResponseSchema,
      checkboxPropertyPageObjectResponseSchema,
      filesPropertyPageObjectResponseSchema,
      createdByPropertyPageObjectResponseSchema,
      createdTimePropertyPageObjectResponseSchema,
      lastEditedByPropertyPageObjectResponseSchema,
      lastEditedTimePropertyPageObjectResponseSchema,
      formulaPropertyPageObjectResponseSchema,
      buttonPropertyPageObjectResponseSchema,
      uniqueIdPropertyPageObjectResponseSchema,
      verificationPropertyPageObjectResponseSchema,
      titlePropertyPageObjectResponseSchema,
      richTextPropertyPageObjectResponseSchema,
      peoplePropertyPageObjectResponseSchema,
      relationPropertyPageObjectResponseSchema,
      rollupPropertyPageObjectResponseSchema,
    ]),
  ),
  icon: z
    .union([
      z.object({
        type: z.literal("emoji"),
        emoji: emojiRequestSchema,
      }),
      z.object({
        type: z.literal("external"),
        external: z.object({
          url: textRequestSchema,
        }),
      }),
      z.object({
        type: z.literal("file"),
        file: z.object({
          url: z.string(),
          expiry_time: z.string(),
        }),
      }),
    ])
    .nullable(),
  cover: z
    .union([
      z.object({
        type: z.literal("external"),
        external: z.object({
          url: textRequestSchema,
        }),
      }),
      z.object({
        type: z.literal("file"),
        file: z.object({
          url: z.string(),
          expiry_time: z.string(),
        }),
      }),
    ])
    .nullable(),
  created_by: partialUserObjectResponseSchema,
  last_edited_by: partialUserObjectResponseSchema,
  object: z.literal("page"),
  id: z.string(),
  created_time: z.string(),
  last_edited_time: z.string(),
  archived: z.boolean(),
  in_trash: z.boolean(),
  url: z.string(),
  public_url: z.string().nullable(),
});

// TODO: 以下のスキーマは再帰的な定義が必要なため、一旦コメントアウトしています
// export const blockObjectResponseWithChildrenSchema = z.union([
//   paragraphBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   heading1BlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   heading2BlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   heading3BlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   bulletedListItemBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   numberedListItemBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   quoteBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   toDoBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   toggleBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   templateBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   syncedBlockBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   childPageBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   childDatabaseBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   equationBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   codeBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   calloutBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   dividerBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   breadcrumbBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   tableOfContentsBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   columnListBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   columnBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   linkToPageBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   tableBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   tableRowBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   embedBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   bookmarkBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   imageBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   videoBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   pdfBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   fileBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   audioBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   linkPreviewBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
//   unsupportedBlockObjectResponseSchema.extend({
//     children: z.array(blockObjectResponseSchema),
//   }),
// ]);

export const blockObjectResponseWithChildrenSchema: z.ZodType = z.lazy(() =>
  z
    .object({
      object: z.literal("block"),
      id: z.string(),
      created_time: z.string(),
      last_edited_time: z.string(),
      created_by: z.object({
        id: z.string(),
      }),
      last_edited_by: z.object({
        id: z.string(),
      }),
      has_children: z.boolean(),
      archived: z.boolean(),
      // ブロックの種類は文字列として受け付けます
      type: z.string(),
    })
    .extend({
      // 子ブロックは存在する場合のみ定義（再帰的に定義）
      children: z.array(blockObjectResponseWithChildrenSchema),
    })
    .passthrough(),
);

export const pageObjectResponseWithBlocksSchema =
  pageObjectResponseSchema.extend({
    blocks: z.array(blockObjectResponseWithChildrenSchema),
  });
