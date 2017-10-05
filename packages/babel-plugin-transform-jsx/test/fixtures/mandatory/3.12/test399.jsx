<scxml initial="s0" version="1.0">
  <state id="s0" initial="s01">
    <onentry>
      <send event="timeout" delay="2s"/>
    </onentry>

    <transition event="timeout" target="fail"/>

    <state id="s01">
      <onentry>
        <raise event="foo"/>
      </onentry>
      <transition event="foo bar" target="s02"/>
    </state>

    <state id="s02">
      <onentry>
        <raise event="bar"/>
      </onentry>
      <transition event="foo bar" target="s03"/>
    </state>

    <state id="s03">
      <onentry>
        <raise event="foo.zoo"/>
      </onentry>

      <transition event="foo bar" target="s04"/>
    </state>

    <state id="s04">
      <onentry>
        <raise event="foos"/>
      </onentry>

      <transition event="foo" target="fail"/>
      <transition event="foos" target="s05"/>
    </state>

    <state id="s05">
      <onentry>
        <raise event="foo.zoo"/>
      </onentry>

      <transition event="foo.*" target="s06"/>
    </state>

    <state id="s06">
      <onentry>
        <raise event="foo"/>
      </onentry>
      <transition event="*" target="pass"/>
    </state>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>
</scxml>
