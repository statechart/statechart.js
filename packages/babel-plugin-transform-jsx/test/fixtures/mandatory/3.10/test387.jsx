<scxml initial="s3" version="1.0">
  <state id="s0" initial="s01">

    <transition event="enteringS011" target="s4"/>
    <transition event="*" target="fail"/>

    <history type="shallow" id="s0HistShallow">
      <transition target="s01"/>
    </history>
    <history type="deep" id="s0HistDeep">
      <transition target="s022"/>
    </history>
    <state id="s01" initial="s011">
      <state id="s011">
        <onentry>
          <raise event="enteringS011"/>
        </onentry>
      </state>
      <state id="s012">
        <onentry>
          <raise event="enteringS012"/>
        </onentry>
      </state>
    </state>
    <state id="s02" initial="s021">
      <state id="s021">
        <onentry>
          <raise event="enteringS021"/>
        </onentry>
      </state>
      <state id="s022">
        <onentry>
          <raise event="enteringS022"/>
        </onentry>
      </state>
    </state>
  </state>

  <state id="s1" initial="s11">

    <transition event="enteringS122" target="pass"/>
    <transition event="*" target="fail"/>

    <history type="shallow" id="s1HistShallow">
      <transition target="s11"/>
    </history>
    <history type="deep" id="s1HistDeep">
      <transition target="s122"/>
    </history>
    <state id="s11" initial="s111">
      <state id="s111">
        <onentry>
          <raise event="enteringS111"/>
        </onentry>
      </state>
      <state id="s112">
        <onentry>
          <raise event="enteringS112"/>
        </onentry>
      </state>
    </state>
    <state id="s12" initial="s121">
      <state id="s121">
        <onentry>
          <raise event="enteringS121"/>
        </onentry>
      </state>
      <state id="s122">
        <onentry>
          <raise event="enteringS122"/>
        </onentry>
      </state>
    </state>
  </state>

  <state id="s3">
    <onentry>
      <send event="timeout" delay="1s"/>
    </onentry>
    <transition target="s0HistShallow"/>
  </state>

  <state id="s4">
    <transition target="s1HistDeep"/>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>
</scxml>
