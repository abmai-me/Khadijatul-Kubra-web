<?php
/**
 * @license MIT
 *
 * Modified by impress-org on 20-December-2023 using Strauss.
 * @see https://github.com/BrianHenryIE/strauss
 */

declare(strict_types=1);

namespace Give\Vendors\Faker\Container;

use Give\Vendors\Psr\Container\ContainerExceptionInterface;

/**
 * @experimental This class is experimental and does not fall under our BC promise
 */
final class ContainerException extends \RuntimeException implements ContainerExceptionInterface
{
}
