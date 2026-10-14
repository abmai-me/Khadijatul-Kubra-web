<?php
/**
 * @license MIT
 *
 * Modified by impress-org on 20-December-2023 using Strauss.
 * @see https://github.com/BrianHenryIE/strauss
 */

namespace Give\Vendors\Faker\Provider\is_IS;

class PhoneNumber extends \Give\Vendors\Faker\Provider\PhoneNumber
{
    /**
     * @var array Icelandic phone number formats.
     */
    protected static $formats = [
        '+354 ### ####',
        '+354 #######',
        '+354#######',
        '### ####',
        '#######',
    ];
}
