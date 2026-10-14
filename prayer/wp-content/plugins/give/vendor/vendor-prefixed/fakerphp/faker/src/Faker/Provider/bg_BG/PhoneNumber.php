<?php
/**
 * @license MIT
 *
 * Modified by impress-org on 20-December-2023 using Strauss.
 * @see https://github.com/BrianHenryIE/strauss
 */

namespace Give\Vendors\Faker\Provider\bg_BG;

class PhoneNumber extends \Give\Vendors\Faker\Provider\PhoneNumber
{
    protected static $formats = [
        '+359(0)#########',
        '+359(0)### ######',
        '+359(0)### ### ###',
        '+359#########',
        '0#########',
        '0### ######',
        '0### ### ###',
        '0### ###-###',
        '(0###) ######',
        '(0###) ### ###',
        '(0###) ###-###',
    ];
}
